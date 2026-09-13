-- Make task link optional (allow NULL)
ALTER TABLE tasks ALTER COLUMN link DROP NOT NULL;

-- Update description comment
COMMENT ON COLUMN tasks.link IS 'External link for the task (optional)';

SELECT 'Task link is now optional!' as message;
