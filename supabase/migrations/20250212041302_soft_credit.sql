/*
  # Create frames management schema

  1. New Tables
    - `frames`
      - `id` (uuid, primary key)
      - `url` (text, required) - The Unsplash image URL
      - `order` (integer, required) - Position in the animation sequence
      - `active` (boolean) - Whether the frame is currently in use
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `frames` table
    - Add policies for authenticated users to manage frames
*/

CREATE TABLE IF NOT EXISTS frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  "order" integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to frames"
  ON frames
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage frames"
  ON frames
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_frames_updated_at
  BEFORE UPDATE ON frames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();