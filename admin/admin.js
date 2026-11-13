import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.MSB_SUPABASE_CONFIG || {};
const $ = (id) => document.getElementById(id);
let supabase = null;
let cache = {enquiries:[],quotes:[],orders:[],customers:[],inventory:[],models:[],reviews:[],stories:[],payments:[]};

function esc(v){return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(v){return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(Number(v||0));}
function date(v){return v?new Date(v).toLocaleDateString("en-CA",{year:"numeric",month:"short",day:"numeric"}):"—";}
function pill(s){const good=["delivered","paid","approved","received","verified","published","active"].includes(s);const bad=["cancelled","declined","rejected","failed","blocked"].includes(s);return '<span class="pill '+(good?"green":bad?"red":["printing","ready_for_pickup","quote_sent","pending"].includes(s)?"blue":"")+'">'+esc(String(s||"").replaceAll("_"," "))+'</span>';}
function toast(msg,bad){const el=$("toast");el.textContent=msg;el.style.borderColor=bad?"#9d3b4e":"#6b563d";el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),4000);}
function msg(id,text,bad){const el=$(id);if(el){el.textContent=text;el.className=bad?"error":"success";}}
function table(id,heads,rows,empty){const el=$(id);if(!el)return;el.innerHTML=rows.length?'<table><thead><tr>'+heads.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table>':'<div class="empty">'+esc(empty||"Nothing here yet.")+'</div>';}
function statusSelect(tableName,id,current,options){return '<select class="status-select" data-status-table="'+tableName+'" data-status-id="'+id+'">'+options.map(o=>'<option value="'+o+'" '+(o===current?"selected":"")+'>'+o.replaceAll("_"," ")+'</option>').join("")+'</select>';}
function view(name){
 document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
 const el=$("view-"+name);if(el)el.classList.remove("hidden");
 document.querySelectorAll(".nav button[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===name));
 const titles={overview:"Overview",enquiries:"Enquiries",quotes:"Quotes",orders:"Print queue",customers:"Customers",inventory:"Filament stock",catalogue:"Model catalogue",community:"Reviews & stories",payments:"Payments"};
 $("pageTitle").textContent=titles[name]||"Workspace";
 history.replaceState(null,"","#"+name);
}
function fillSelects(){
 $("quoteEnquiry").innerHTML=cache.enquiries.filter(x=>!["converted","closed","declined"].includes(x.status)).map(x=>'<option value="'+x.id+'">#'+x.enquiry_number+' · '+esc((x.customer&&x.customer.name)||"Customer")+' · '+esc(x.request_type)+'</option>').join("")||'<option value="">No open enquiries</option>';
 $("payOrder").innerHTML=cache.orders.map(x=>'<option value="'+x.id+'">MS-'+x.order_number+' · '+esc((x.customer&&x.customer.name)||"Customer")+'</option>').join("")||'<option value="">No orders yet</option>';
}
function render(){
 $("statNew").textContent=cache.enquiries.filter(x=>x.status==="new").length;
 $("statQuotes").textContent=cache.quotes.filter(x=>["draft","sent"].includes(x.status)).length;
 $("statPrinting").textContent=cache.orders.filter(x=>["queued","preparing","printing","quality_check","ready_for_pickup"].includes(x.status)).length;
 $("statDelivered").textContent=cache.orders.filter(x=>x.status==="delivered").length;
 const recent=cache.enquiries.slice(0,6);
 table("recentEnquiries",["Customer / request","Status","Received"],recent.map(x=>'<tr><td><b>'+esc((x.customer&&x.customer.name)||"Customer")+'</b><small>'+esc((x.customer&&x.customer.email)||"")+' · '+esc(x.request_type)+'</small></td><td>'+pill(x.status)+'</td><td>'+date(x.created_at)+'</td></tr>'),"No enquiries have synced yet. Connect the FormSubmit webhook after Supabase setup.");
 const counts={};cache.enquiries.forEach(x=>{const k=x.request_type||"Other";counts[k]=(counts[k]||0)+1;});
 const pairs=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);const max=Math.max(1,...pairs.map(x=>x[1]));
 $("categoryBars").innerHTML=pairs.length?pairs.map(x=>'<div class="bar-item"><span>'+esc(x[0])+'</span><div class="bar"><i style="width:'+Math.round(x[1]/max*100)+'%"></i></div><b>'+x[1]+'</b></div>').join(""):'<div class="empty">No enquiry data yet.</div>';
 const enquiryRows=cache.enquiries.map(x=>'<tr><td><b>#'+(x.enquiry_number||"—")+'</b><small>'+date(x.created_at)+'</small></td><td>'+esc((x.customer&&x.customer.name)||"—")+'<small>'+esc((x.customer&&x.customer.email)||"")+'</small></td><td>'+esc(x.request_type)+'</td><td>'+esc(x.material_preference||"—")+' / '+esc(x.colour_preference||"—")+'</td><td>'+(x.uploaded_file_names?'<span class="pill green">File listed</span><small>'+esc(x.uploaded_file_names)+'</small>':x.files_in_email?'<span class="pill green">Check Gmail</span>':"—")+'</td><td>'+statusSelect("enquiries",x.id,x.status,["new","reviewing","quote_draft","quote_sent","approved","declined","converted","closed"])+'</td><td><button class="small-btn" data-action="email" data-email="'+esc((x.customer&&x.customer.email)||"")+'" data-name="'+esc((x.customer&&x.customer.name)||"")+'" data-enquiry="'+x.id+'">Email</button></td></tr>');
 table("enquiriesTable",["Ref / date","Customer","Request","Preference","Files","Status","Action"],enquiryRows,"No enquiries yet. Gmail will continue to receive the original submission.");
 table("quotesTable",["Quote","Customer","Amount","Status","Created","Notes"],cache.quotes.map(x=>'<tr><td>Q-'+x.quote_number+'</td><td>'+esc((x.enquiry&&x.enquiry.customer&&x.enquiry.customer.name)||"—")+'</td><td>'+money(x.amount)+'</td><td>'+statusSelect("quotes",x.id,x.status,["draft","sent","approved","declined","expired"])+'</td><td>'+date(x.created_at)+'</td><td>'+esc(x.notes||"—")+'</td></tr>'),"No quotes recorded yet.");
 table("ordersTable",["Order","Customer","Material / colour","Qty","Est. grams","Est. hours","Status","Payment"],cache.orders.map(x=>'<tr><td><b>MS-'+x.order_number+'</b><small>'+date(x.created_at)+'</small></td><td>'+esc((x.customer&&x.customer.name)||"—")+'<small>'+esc((x.customer&&x.customer.email)||"")+'</small></td><td>'+esc(x.material||"—")+' · '+esc(x.colour||"—")+'</td><td>'+x.quantity+'</td><td>'+(x.estimated_grams??"—")+' g</td><td>'+(x.estimated_hours??"—")+' h</td><td>'+statusSelect("orders",x.id,x.status,["queued","preparing","printing","quality_check","ready_for_pickup","delivered","cancelled"])+'</td><td>'+pill(x.payment_status)+'</td></tr>'),"No print jobs yet. Convert an approved enquiry into an order or add one manually.");
 table("customersTable",["Customer","Email","Phone","Company","Added","Enquiries"],cache.customers.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+esc(x.email)+'</td><td>'+esc(x.phone||"—")+'</td><td>'+esc(x.company||"—")+'</td><td>'+date(x.created_at)+'</td><td>'+cache.enquiries.filter(e=>e.customer_id===x.id).length+'</td></tr>'),"Customers will be created as website enquiries arrive.");
 table("inventoryTable",["Material","Colour","Brand","Remaining / total","Cost / kg","Status","Quick edit"],cache.inventory.map(x=>'<tr><td>'+esc(x.material)+'</td><td>'+esc(x.colour)+'</td><td>'+esc(x.brand||"—")+'</td><td>'+Number(x.remaining_weight_g).toFixed(0)+' / '+Number(x.spool_weight_g).toFixed(0)+' g</td><td>'+(x.cost_per_kg?money(x.cost_per_kg):"—")+'</td><td>'+pill(x.is_active?"active":"inactive")+'</td><td><button class="small-btn" data-action="deplete" data-id="'+x.id+'">−100 g</button></td></tr>'),"Add current spools to start tracking stock.");
 const total=cache.inventory.filter(x=>x.is_active).reduce((n,x)=>n+Number(x.remaining_weight_g||0),0);
 $("inventorySummary").innerHTML='<div class="stat"><span>Active spools</span><strong>'+cache.inventory.filter(x=>x.is_active).length+'</strong></div><p class="help">Estimated remaining across active spools: <b>'+total.toFixed(0)+' g</b>.</p>';
 table("catalogueTable",["Model / creator","Source / format","Licence","Review","Commercial use","Website","Actions"],cache.models.map(x=>'<tr><td><b>'+esc(x.title)+'</b><small>'+esc(x.creator||"")+'</small></td><td>'+esc(x.source_platform||"—")+'<small>'+esc(x.file_format||"")+'</small></td><td>'+esc(x.licence||"Not recorded")+'</td><td>'+pill(x.review_status)+'</td><td>'+(x.commercial_use_verified?pill("commercial checked"):pill("not verified"))+'</td><td>'+(x.is_published?pill("published"):pill("hidden"))+'</td><td><div class="row-actions"><button class="small-btn" data-action="verify-model" data-id="'+x.id+'">Mark reviewed</button><button class="small-btn" data-action="publish-model" data-id="'+x.id+'" data-publish="'+(!x.is_published)+'">'+(x.is_published?"Unpublish":"Publish")+'</button></div></td></tr>'),"No catalogue entries yet. Add the existing website picks to this catalogue.");
 table("reviewsTable",["Customer / order","Rating","Review","Photo","Status","Moderation"],cache.reviews.map(x=>'<tr><td><b>'+esc(x.customer_name)+'</b><small>'+date(x.created_at)+' · '+esc(x.order_reference||"")+'</small></td><td>'+("★".repeat(x.rating))+("☆".repeat(5-x.rating))+'</td><td>'+esc(x.review_text)+'</td><td>'+esc(x.photo_file_names||"—")+'</td><td>'+pill(x.moderation_status)+'</td><td><div class="row-actions"><button class="small-btn" data-action="review-approve" data-id="'+x.id+'">Approve</button><button class="small-btn" data-action="review-reject" data-id="'+x.id+'">Reject</button></div></td></tr>'),"No customer reviews have synced yet.");
 table("storiesTable",["Story","Summary","Permission","Website","Action"],cache.stories.map(x=>'<tr><td><b>'+esc(x.title)+'</b><small>'+esc(x.category||"")+'</small></td><td>'+esc(x.summary||"—")+'</td><td>'+(x.customer_permission?pill("permission given"):pill("permission needed"))+'</td><td>'+(x.is_published?pill("published"):pill("draft"))+'</td><td><button class="small-btn" data-action="story-publish" data-id="'+x.id+'" data-publish="'+(!x.is_published)+'">'+(x.is_published?"Unpublish":"Publish")+'</button></td></tr>'),"No project stories entered yet.");
 table("paymentsTable",["Date","Amount","Method","Status","Reference","Order"],cache.payments.map(x=>'<tr><td>'+date(x.paid_at||x.created_at)+'</td><td>'+money(x.amount)+'</td><td>'+esc(x.method)+'</td><td>'+pill(x.status)+'</td><td>'+esc(x.reference||"—")+'</td><td>'+((x.order&&x.order.order_number)?"MS-"+x.order.order_number:"—")+'</td></tr>'),"No payments recorded yet.");
 const received=cache.payments.filter(x=>x.status==="received").reduce((n,x)=>n+Number(x.amount||0),0);
 $("paymentSummary").innerHTML='<div class="stat"><span>Manually recorded payments</span><strong>'+money(received)+'</strong></div>';
 fillSelects();
}
async function load(){
 const specs=[
 ["enquiries",supabase.from("enquiries").select("*,customer:customers(name,email)").order("created_at",{ascending:false}).limit(200)],
 ["quotes",supabase.from("quotes").select("*,enquiry:enquiries(request_type,customer:customers(name,email))").order("created_at",{ascending:false}).limit(200)],
 ["orders",supabase.from("orders").select("*,customer:customers(name,email)").order("created_at",{ascending:false}).limit(200)],
 ["customers",supabase.from("customers").select("*").order("created_at",{ascending:false}).limit(500)],
 ["inventory",supabase.from("filament_inventory").select("*").order("updated_at",{ascending:false})],
 ["models",supabase.from("model_catalog").select("*").order("created_at",{ascending:false}).limit(500)],
 ["reviews",supabase.from("reviews").select("*").order("created_at",{ascending:false}).limit(300)],
 ["stories",supabase.from("project_stories").select("*").order("sort_order").limit(300)],
 ["payments",supabase.from("payments").select("*,order:orders(order_number)").order("created_at",{ascending:false}).limit(500)]
 ];
 const results=await Promise.all(specs.map(async x=>[x[0],await x[1]]));
 const errors=results.filter(x=>x[1].error);if(errors.length){console.error(errors);toast("Some data could not load. Check that the database schema has been run.",true);}
 results.forEach(x=>{if(!x[1].error)cache[x[0]]=x[1].data||[];});render();
}
async function checkAdmin(user){
 const r=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
 if(r.error||!r.data)throw new Error("This account is not allow-listed. Add the Auth user's UUID to public.admin_users.");
}
async function start(user){
 await checkAdmin(user);$("loginScreen").classList.add("hidden");$("appShell").classList.remove("hidden");
 $("signedInAs").textContent=user.email||"Admin";await load();
 const wanted=location.hash.slice(1);view(["overview","enquiries","quotes","orders","customers","inventory","catalogue","community","payments"].includes(wanted)?wanted:"overview");
}
async function manualEnquiry(){
 const name=prompt("Customer name");if(!name)return;const email=prompt("Customer email");if(!email)return;
 const request=prompt("Request type","On-demand printing")||"On-demand printing";const details=prompt("What does the customer need?")||"";
 let c=await supabase.from("customers").select("id").eq("email",email.toLowerCase()).maybeSingle();if(c.error)throw c.error;
 if(!c.data){c=await supabase.from("customers").insert({name:name,email:email.toLowerCase()}).select("id").single();if(c.error)throw c.error;}
 const e=await supabase.from("enquiries").insert({customer_id:c.data.id,source:"manual",request_type:request,project_details:details}).select("id").single();if(e.error)throw e.error;
 await supabase.from("enquiry_events").insert({enquiry_id:e.data.id,event_type:"created",event_note:"Manually added in admin dashboard"});await load();toast("Enquiry added.");
}
async function manualOrder(){
 if(!cache.enquiries.length){toast("Add an enquiry first.",true);return;}
 const opts=cache.enquiries.map(x=>x.id+" | #"+x.enquiry_number+" "+((x.customer&&x.customer.name)||"")).join("\n");
 const selected=prompt("Paste the enquiry ID to convert into an order:\n"+opts);if(!selected)return;
 const e=cache.enquiries.find(x=>x.id===selected.trim());if(!e){toast("Enquiry ID not recognised.",true);return;}
 const material=prompt("Material","PLA")||"PLA";const colour=prompt("Colour","Black")||"Black";
 const grams=Number(prompt("Estimated filament grams","0")||0);const hours=Number(prompt("Estimated print hours","0")||0);
 const r=await supabase.from("orders").insert({enquiry_id:e.id,customer_id:e.customer_id,material:material,colour:colour,estimated_grams:grams,estimated_hours:hours,quantity:e.quantity||1});
 if(r.error)throw r.error;await supabase.from("enquiries").update({status:"converted"}).eq("id",e.id);await load();toast("Order added to print queue.");
}
async function doAction(b){
 const action=b.dataset.action,id=b.dataset.id;
 if(action==="email"){
  const e=cache.enquiries.find(x=>x.id===b.dataset.enquiry);const subject=encodeURIComponent("MadeBySavyo Labs — "+((e&&e.request_type)||"print enquiry")+" quote");
  const body=encodeURIComponent("Hi "+(b.dataset.name||"there")+",\n\nThanks for reaching out to MadeBySavyo Labs. I'll review your request and follow up with the quote and next steps.\n\nRegards,\nMadeBySavyo Labs");
  location.href="mailto:"+b.dataset.email+"?subject="+subject+"&body="+body;return;
 }
 if(action==="deplete"){const x=cache.inventory.find(x=>x.id===id);const r=await supabase.from("filament_inventory").update({remaining_weight_g:Math.max(0,Number(x.remaining_weight_g)-100)}).eq("id",id);if(r.error)throw r.error;await load();toast("Stock reduced by 100 g.");return;}
 if(action==="verify-model"){const r=await supabase.from("model_catalog").update({review_status:"verified"}).eq("id",id);if(r.error)throw r.error;await load();toast("Marked reviewed. Verify commercial rights separately.");return;}
 if(action==="publish-model"){const x=cache.models.find(x=>x.id===id),publish=b.dataset.publish==="true";if(publish&&(!x.commercial_use_verified||x.review_status!=="verified")){toast("Verify rights and review status before publishing.",true);return;}const r=await supabase.from("model_catalog").update({is_published:publish}).eq("id",id);if(r.error)throw r.error;await load();toast(publish?"Model published.":"Model unpublished.");return;}
 if(action==="review-approve"||action==="review-reject"){const status=action==="review-approve"?"approved":"rejected";const r=await supabase.from("reviews").update({moderation_status:status,published_at:status==="approved"?new Date().toISOString():null}).eq("id",id);if(r.error)throw r.error;await load();toast("Review moderation saved.");return;}
 if(action==="story-publish"){const s=cache.stories.find(x=>x.id===id),publish=b.dataset.publish==="true";if(publish&&!s.customer_permission){toast("Get customer permission before publishing.",true);return;}const r=await supabase.from("project_stories").update({is_published:publish}).eq("id",id);if(r.error)throw r.error;await load();toast("Story publishing status saved.");}
}
async function saveForm(form){
 if(form.id==="quoteForm"){
  const enquiryId=$("quoteEnquiry").value;if(!enquiryId)throw new Error("Select an enquiry first.");
  const a=Number($("qMaterial").value||0),b=Number($("qMachine").value||0),c=Number($("qDesign").value||0),d=Number($("qFinishing").value||0),discount=Number($("qDiscount").value||0),amount=Math.max(0,a+b+c+d-discount);
  const r=await supabase.from("quotes").insert({enquiry_id:enquiryId,material_cost:a,machine_cost:b,design_cost:c,finishing_cost:d,discount:discount,amount:amount,notes:$("qNotes").value||null,valid_until:$("qValid").value||null});
  if(r.error)throw r.error;await supabase.from("enquiries").update({status:"quote_draft"}).eq("id",enquiryId);form.reset();await load();msg("quoteMessage","Draft quote saved: "+money(amount)+". Review it and send the customer-facing quote through Gmail.");return;
 }
 if(form.id==="filamentForm"){
  const r=await supabase.from("filament_inventory").insert({material:$("fMaterial").value,colour:$("fColour").value,brand:$("fBrand").value||null,spool_weight_g:Number($("fSpool").value),remaining_weight_g:Number($("fRemaining").value),cost_per_kg:$("fCost").value?Number($("fCost").value):null,notes:$("fNotes").value||null});
  if(r.error)throw r.error;form.reset();await load();toast("Filament spool added.");return;
 }
 if(form.id==="modelForm"){
  const r=await supabase.from("model_catalog").insert({title:$("mTitle").value,creator:$("mCreator").value||null,source_platform:$("mPlatform").value||null,source_url:$("mUrl").value,file_format:$("mFormat").value||null,licence:$("mLicence").value||null,category:$("mCategory").value||null,thumbnail_url:$("mThumb").value||null,description:$("mDescription").value||null,commercial_use_verified:$("mCommercial").checked,attribution_required:$("mAttribution").checked,review_status:"needs_review",is_published:false});
  if(r.error)throw r.error;form.reset();await load();toast("Model saved for review.");return;
 }
 if(form.id==="storyForm"){
  const r=await supabase.from("project_stories").insert({title:$("sTitle").value,category:$("sCategory").value||null,summary:$("sSummary").value||null,material:$("sMaterial").value||null,image_url:$("sImage").value||null,video_url:$("sVideo").value||null,customer_permission:$("sPermission").checked,is_published:false,sort_order:100});
  if(r.error)throw r.error;form.reset();await load();toast("Project story saved as an unpublished draft.");return;
 }
 if(form.id==="paymentForm"){
  const orderId=$("payOrder").value;if(!orderId)throw new Error("Create an order first.");const order=cache.orders.find(x=>x.id===orderId);const amount=Number($("payAmount").value);
  const r=await supabase.from("payments").insert({order_id:orderId,customer_id:order.customer_id||null,amount:amount,method:$("payMethod").value,reference:$("payReference").value||null,paid_at:$("payDate").value||new Date().toISOString(),notes:$("payNotes").value||null,status:"received"});
  if(r.error)throw r.error;const total=cache.payments.filter(x=>x.order_id===orderId&&x.status==="received").reduce((n,x)=>n+Number(x.amount||0),0)+amount;
  const pstatus=total>=Number(order.total_amount||0)&&Number(order.total_amount||0)>0?"paid":"deposit_paid";await supabase.from("orders").update({payment_status:pstatus}).eq("id",orderId);
  form.reset();await load();toast("Payment recorded.");return;
 }
}
async function boot(){
 if(!cfg.url||!cfg.anonKey||!cfg.url.startsWith("https://")){$("configWarning").classList.remove("hidden");$("loginForm").querySelector("button").disabled=true;$("loginMessage").textContent="Add the Supabase URL and public key to admin/config.js first.";return;}
 supabase=createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const s=await supabase.auth.getSession();if(s.data.session){try{await start(s.data.session.user);}catch(e){$("loginMessage").textContent=e.message;await supabase.auth.signOut();}}
 supabase.auth.onAuthStateChange(async(event,session)=>{if(event==="SIGNED_IN"&&session){try{await start(session.user);}catch(e){toast(e.message,true);await supabase.auth.signOut();}}if(event==="SIGNED_OUT"){$("appShell").classList.add("hidden");$("loginScreen").classList.remove("hidden");}});
}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!supabase)return;const email=$("loginEmail").value.trim().toLowerCase();
 if(cfg.adminEmail&&email!==cfg.adminEmail.toLowerCase()){msg("loginMessage","Use the allow-listed admin email.",true);return;}
 msg("loginMessage","Sending secure sign-in link…");const r=await supabase.auth.signInWithOtp({email:email,options:{shouldCreateUser:false,emailRedirectTo:location.href.split("#")[0]}});msg("loginMessage",r.error?r.error.message:"Sign-in link sent. Open the email to access the private dashboard.",Boolean(r.error));
});
$("signOutBtn").addEventListener("click",async()=>{if(supabase)await supabase.auth.signOut();});
$("refreshBtn").addEventListener("click",async()=>{await load();toast("Dashboard refreshed.");});
$("mainNav").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)view(b.dataset.view);});
document.addEventListener("click",async e=>{
 const v=e.target.closest("[data-view]");if(v){view(v.dataset.view);return;}
 const b=e.target.closest("[data-action]");if(!b)return;
 try{if(b.dataset.action==="new-enquiry")await manualEnquiry();else if(b.dataset.action==="new-order")await manualOrder();else await doAction(b);}catch(err){console.error(err);toast(err.message||"Action failed.",true);}
});
document.addEventListener("change",async e=>{
 const s=e.target.closest("[data-status-table]");if(!s)return;
 try{const r=await supabase.from(s.dataset.statusTable).update({status:s.value,updated_at:new Date().toISOString()}).eq("id",s.dataset.statusId);if(r.error)throw r.error;await load();toast("Status updated.");}catch(err){toast(err.message||"Could not update status.",true);}
});
document.addEventListener("submit",async e=>{
 if(!["quoteForm","filamentForm","modelForm","paymentForm","storyForm"].includes(e.target.id))return;
 e.preventDefault();try{await saveForm(e.target);}catch(err){console.error(err);toast(err.message||"Could not save record.",true);}
});
function filterEnquiries(){
 const q=$("enquirySearch").value.toLowerCase(),status=$("enquiryFilter").value;
 const found=cache.enquiries.filter(x=>(!status||x.status===status)&&(((x.customer&&x.customer.name)||"")+" "+((x.customer&&x.customer.email)||"")+" "+x.request_type+" "+(x.project_details||"")).toLowerCase().includes(q));
 const rows=found.map(x=>'<tr><td><b>#'+x.enquiry_number+'</b><small>'+date(x.created_at)+'</small></td><td>'+esc((x.customer&&x.customer.name)||"—")+'<small>'+esc((x.customer&&x.customer.email)||"")+'</small></td><td>'+esc(x.request_type)+'</td><td>'+esc(x.material_preference||"—")+' / '+esc(x.colour_preference||"—")+'</td><td>'+(x.uploaded_file_names?'<span class="pill green">File listed</span><small>'+esc(x.uploaded_file_names)+'</small>':x.files_in_email?'<span class="pill green">Check Gmail</span>':"—")+'</td><td>'+statusSelect("enquiries",x.id,x.status,["new","reviewing","quote_draft","quote_sent","approved","declined","converted","closed"])+'</td><td><button class="small-btn" data-action="email" data-email="'+esc((x.customer&&x.customer.email)||"")+'" data-name="'+esc((x.customer&&x.customer.name)||"")+'" data-enquiry="'+x.id+'">Email</button></td></tr>');
 table("enquiriesTable",["Ref / date","Customer","Request","Preference","Files","Status","Action"],rows,"No matching enquiries.");
}
$("enquirySearch").addEventListener("input",filterEnquiries);$("enquiryFilter").addEventListener("change",filterEnquiries);
boot().catch(e=>{console.error(e);msg("loginMessage",e.message,true);});
