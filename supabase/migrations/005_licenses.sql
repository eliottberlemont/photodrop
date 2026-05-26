CREATE TABLE user_licenses (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;

-- Users can read their own row to check if they're activated
CREATE POLICY "users_read_own_license" ON user_licenses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
