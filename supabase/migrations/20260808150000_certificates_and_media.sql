-- Adds support for uploaded files: certificate documents, project cover
-- images, and a profile photo. Existing rows get the empty-string default,
-- matching this project's convention of NOT NULL text columns over nulls.

-- Certifications: an uploaded document (PDF or image) in addition to the
-- existing external "credential URL" text field.
ALTER TABLE public.certifications ADD COLUMN file_path text NOT NULL DEFAULT '';
ALTER TABLE public.certifications ADD COLUMN file_type text NOT NULL DEFAULT '';
ALTER TABLE public.certifications ADD COLUMN file_size bigint NOT NULL DEFAULT 0;

-- Projects: optional cover image shown on the project card.
ALTER TABLE public.projects ADD COLUMN image_path text NOT NULL DEFAULT '';

-- Site settings: optional profile photo shown in the hero section.
ALTER TABLE public.site_settings ADD COLUMN avatar_path text NOT NULL DEFAULT '';

-- Storage buckets -----------------------------------------------------------
-- `certificates`    — uploaded certificate documents (PDF or image).
-- `portfolio-media` — profile photo + project cover images.
-- Both are public-read (the portfolio itself is public) with size/type limits
-- enforced at the bucket level as defense in depth alongside client checks.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('certificates', 'certificates', true, 10485760,
   ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']),
  ('portfolio-media', 'portfolio-media', true, 5242880,
   ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies ------------------------------------------------------
-- storage.objects already has RLS enabled by default on Supabase projects.
-- Public can view/download everything in both buckets.
CREATE POLICY "Public can view certificate files" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Public can view portfolio media" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

-- Only admins (public.has_role, same helper the rest of the schema uses)
-- may upload, replace, or delete files.
CREATE POLICY "Admins upload certificate files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update certificate files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete certificate files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload portfolio media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update portfolio media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete portfolio media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'));