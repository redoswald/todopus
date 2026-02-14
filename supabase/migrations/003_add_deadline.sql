-- Add deadline column to tasks
-- deadline = hard deadline (must be done by this date)
-- due_date = soft date (when you plan to work on it)

ALTER TABLE tasks ADD COLUMN deadline DATE;

-- Add index for queries filtering by deadline
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
