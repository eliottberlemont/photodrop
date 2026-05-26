-- Store the Drive folder link per upload so customers can access it
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS folder_link TEXT;

-- Customers can read rows where their email matches
CREATE POLICY "customers_view_own_files"
ON uploaded_files
FOR SELECT
TO authenticated
USING (customer_email = auth.email());
