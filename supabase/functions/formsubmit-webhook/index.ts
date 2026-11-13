// Supabase Edge Function: mirror FormSubmit submissions into the private dashboard.
// Deploy with: supabase functions deploy formsubmit-webhook --no-verify-jwt
// Add this function URL as the hidden _webhook field in the public quote and review forms.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clean = (v: unknown, max = 3000) => typeof v === "string" ? v.trim().slice(0, max) : "";
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "POST required" }, 405);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 1024 * 1024) return reply({ error: "Payload too large" }, 413);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply({ error: "Expected JSON payload" }, 400); }

  // FormSubmit.co documents _webhook payloads as { form_data: { submitted fields } }.
  const form = (body.form_data && typeof body.form_data === "object" ? body.form_data : body) as Record<string, unknown>;
  const subject = clean(form._subject, 180);
  const name = clean(form.name, 120);
  const email = clean(form.email, 320).toLowerCase();
  if (clean(form._honey, 500)) return reply({ ok: true, ignored: true });
  if (!name || !validEmail(email)) return reply({ error: "Name and valid email are required" }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return reply({ error: "Supabase function secrets are missing" }, 500);
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const sourceHash = await hash(JSON.stringify(body));

  // The review form is also mirrored for manual moderation.
  const isReview = /customer review/i.test(subject) || Boolean(form.rating && form.review);
  if (isReview) {
    const ratingText = clean(form.rating, 10);
    const ratingMatch = ratingText.match(/[1-5]/);
    const rating = Math.min(5, Math.max(1, Number(ratingMatch ? ratingMatch[0] : 5)));
    const result = await db.from("reviews").insert({
      customer_name: name,
      order_reference: clean(form.order_reference, 80) || null,
      rating,
      review_text: clean(form.review, 3000),
      photo_file_names: clean(form.review_photo_names || form.uploaded_file_names, 1200) || null,
      permission_to_feature: ["yes", "true", "on"].includes(clean(form.permission_to_feature, 20).toLowerCase()),
      moderation_status: "pending"
    });
    if (result.error) return reply({ error: "Review could not be mirrored", detail: result.error.message }, 500);
    return reply({ ok: true, type: "review" });
  }

  let customerResult = await db.from("customers").select("id").eq("email", email).maybeSingle();
  if (customerResult.error) return reply({ error: "Customer lookup failed" }, 500);
  if (!customerResult.data) {
    customerResult = await db.from("customers").insert({ name, email }).select("id").single();
    if (customerResult.error) return reply({ error: "Customer creation failed" }, 500);
  } else {
    await db.from("customers").update({ name }).eq("id", customerResult.data.id);
  }

  const fileNames = clean(form.uploaded_file_names, 1200);
  const attachmentValue = form.attachment || form.files || null;
  const enquiry = {
    customer_id: customerResult.data.id,
    source: "website",
    request_type: clean(form.request_type, 140) || "On-demand printing",
    status: "new",
    quantity: Math.max(1, Math.min(500, Number(form.quantity || 1) || 1)),
    model_link: clean(form.model_link, 1000) || null,
    material_preference: clean(form.material_preference, 100) || null,
    colour_preference: clean(form.colour_preference, 100) || null,
    project_details: clean(form.project_details || form.message, 3000),
    uploaded_file_names: fileNames || null,
    files_in_email: Boolean(fileNames || attachmentValue),
    source_hash: sourceHash,
    source_payload: {
      submitted_field_names: Object.keys(form).filter((key) => !key.startsWith("_")),
      attachment_metadata_present: Boolean(attachmentValue),
      mirrored_at: new Date().toISOString()
    }
  };

  const saved = await db.from("enquiries")
    .upsert(enquiry, { onConflict: "source_hash", ignoreDuplicates: true })
    .select("id").maybeSingle();
  if (saved.error) return reply({ error: "Enquiry could not be mirrored", detail: saved.error.message }, 500);

  if (saved.data?.id) {
    await db.from("enquiry_events").insert({
      enquiry_id: saved.data.id,
      event_type: "website_enquiry_received",
      event_note: "Mirrored from FormSubmit. Original enquiry notification and attached files are sent to the Gmail business inbox."
    });
    if (fileNames) {
      await db.from("enquiry_files").insert({
        enquiry_id: saved.data.id,
        file_name: fileNames,
        source: "email"
      });
    }
  }
  return reply({ ok: true, type: "enquiry", duplicate: !saved.data });
});
