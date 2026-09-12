-- Check for triggers on auth.users table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND trigger_schema = 'auth';

-- Also check functions that might be involved
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%auth%'
  OR routine_name LIKE '%profile%';
