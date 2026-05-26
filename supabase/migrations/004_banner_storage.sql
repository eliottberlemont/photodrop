-- Public bucket for user email banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder
CREATE POLICY "Users upload own banner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated users can replace their own banner
CREATE POLICY "Users update own banner"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anyone can read banners (needed for email img tags)
CREATE POLICY "Public read banners"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'banners');
