-- Seed the existing public 12-model shelf into the private admin catalogue.
-- Entries are intentionally NOT published or marked commercially verified until reviewed.
insert into public.model_catalog
(title,creator,source_platform,source_url,file_format,licence,category,description,commercial_use_verified,attribution_required,review_status,is_published)
values
('ESP32 with antenna case','pazzicz','Printables','https://www.printables.com/model/377252-esp32-with-antenna-case','STL','CC BY 4.0','Electronics','A practical enclosure starting point for ESP32 projects. Confirm board revision and antenna clearance.',false,true,'needs_review',false),
('ESP32 external antenna case','michal','Printables','https://www.printables.com/model/877771-case-for-esp32-with-external-antenna','STL','CC BY-SA 4.0','Electronics','A remix with ventilation and a modified lid for an ESP32-WROOM-32U-style board.',false,true,'needs_review',false),
('The Circuit Caddy','MSBstudios','Printables','https://www.printables.com/model/1689910-the-circuit-caddy','STL','CC BY 4.0','Desk / Maker','PCB-inspired desk organizer with compartments for pens, tools and small tech gear.',false,true,'needs_review',false),
('Self-adjusting phone stand','HomeDesign','Nexprint','https://www.nexprint.com/en/models/G4880565','3MF','CC BY','Desk accessory','A compact adaptive stand for portrait and landscape phone viewing.',false,true,'needs_review',false),
('Minimal phone stand','Dat Nguyen','Nexprint','https://www.nexprint.com/en/models/G0335768','3MF','CC BY','Desk accessory','A simple everyday desk stand. Confirm file and licence terms on the model page.',false,true,'needs_review',false),
('Cat phone stand','Duo3DPrint','Nexprint','https://www.nexprint.com/en/models/G4555142','3MF','CC BY','Desk accessory','A playful phone holder with a cat-inspired design.',false,true,'needs_review',false),
('Filament clip','huba','Nexprint','https://www.nexprint.com/en/models/G2270687','STL / 3MF','CC BY','Printer accessory','A small spool-edge clip to keep filament ends tidy.',false,true,'needs_review',false),
('Notebook organizer','Home','Nexprint','https://www.nexprint.com/en/models/1989288272534388736','STL','CC BY','Home / Office','Multi-slot notebook storage with a pen holder.',false,true,'needs_review',false),
('Geometric desk organizer','Tallat Mehmood','Printables','https://www.printables.com/model/1762974-modern-geometric-desk-organizer-plant-pot-cover','STL','Public Domain','Home / Decor','A cylindrical organizer and planter cover.',false,false,'needs_review',false),
('Simple business card stand','CrazyModding','Printables','https://www.printables.com/model/1177632-simple-business-card-stand','STL','CC0','Business','A simple display stand for standard business cards.',false,false,'needs_review',false),
('Tetris desk organizer','BM Paridae','Printables','https://www.printables.com/model/556447-tetris-desk-organizer','STL','CC BY 4.0','Desk / Office','Modular organizer for pens, notes and desk accessories.',false,true,'needs_review',false),
('Desk organizer','Make3D Company Limited','Printables','https://www.printables.com/model/588877-desk-organizer','STL','CC BY-SA 4.0','Home / Office','A multi-use organizer for a phone, stationery, tools and small desk items.',false,true,'needs_review',false)
on conflict (source_url) do nothing;
