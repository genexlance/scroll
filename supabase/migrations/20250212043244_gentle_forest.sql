/*
  # Create Storage Bucket for Frames

  1. New Storage
    - Creates 'frames' bucket for storing animation frames
    - Sets bucket to public
  2. Security
    - Adds policies for authenticated users to manage files
    - Allows public read access
*/

-- Create the frames bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('frames', 'frames', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to frames bucket
CREATE POLICY "Allow public read access to frames"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'frames');

-- Allow authenticated users to upload frames
CREATE POLICY "Allow authenticated users to upload frames"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'frames');

-- Allow authenticated users to update their frames
CREATE POLICY "Allow authenticated users to update frames"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'frames');

-- Allow authenticated users to delete frames
CREATE POLICY "Allow authenticated users to delete frames"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'frames');