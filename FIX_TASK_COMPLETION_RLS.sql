-- Allow users to delete their own verifying task completions (for redo functionality)

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own verifying completions" ON task_completions;

-- Create new delete policy that allows users to delete their own verifying tasks
CREATE POLICY "Users can delete their own verifying completions"
ON task_completions
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'verifying'
);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'task_completions'
ORDER BY cmd, policyname;
