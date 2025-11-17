-- Create the storage bucket for log files
INSERT INTO storage.buckets (id, name, public)
VALUES ('logs', 'logs', false)
ON CONFLICT (id) DO NOTHING;

-- Create the RLS policy to allow anonymous uploads
CREATE POLICY "Allow anonymous uploads to logs bucket"
ON storage.objects FOR INSERT TO anon
WITH CHECK ( bucket_id = 'logs' );
