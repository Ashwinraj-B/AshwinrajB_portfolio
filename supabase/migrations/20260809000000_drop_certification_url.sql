-- Certifications now rely solely on the uploaded document (file_path /
-- file_type / file_size, added in certificates_and_media). The external
-- "credential URL" is no longer collected or displayed — drop the column.
alter table public.certifications drop column url;