# Quote and review form setup

The public site includes no-login forms for quote requests and customer reviews.

- Recipient: savieoseb@gmail.com
- Service: FormSubmit
- Encoding: multipart/form-data
- Quote file types: STL, 3MF, OBJ, STEP/STP, ZIP, and supporting images/PDF
- Review attachments: product photos
- Current documented attachment ceiling: 10 MB combined per submission

## First-time activation
FormSubmit may send an activation email to savieoseb@gmail.com. Open that email and confirm the form endpoint. Do not advertise live uploads until this is done.

## Important privacy and file handling
Form submissions and files pass through FormSubmit before delivery to the inbox. Review its terms and privacy policy and add a clear privacy notice to the website. Ask users only for information needed to quote the job. Do not encourage confidential CAD/IP, personal data or restricted files to be uploaded through this starter flow. The customer should confirm they have rights to share a model for quotation.

The 10 MB ceiling is restrictive for some complex 3D files. For larger/private file handoff, the next backend should use Cloudflare Worker + private R2 bucket or Supabase Storage with short-lived upload links, file type/size checks and access controls. Email should contain a secure download link and project reference rather than large CAD attachments.

FormSubmit documentation: https://formsubmit.co/documentation
