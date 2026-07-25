ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
