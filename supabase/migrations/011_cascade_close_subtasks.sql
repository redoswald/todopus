-- When a task transitions from 'open' to 'done' or 'cancelled',
-- close all of its open descendants (any depth) with the same status
-- and the same completed_at. This keeps the data model consistent
-- across surfaces (web UI, MCP, iOS) and eliminates "orphan subtasks
-- whose parent is closed" as a representable state.
--
-- pg_trigger_depth() guard: the recursive CTE inside the function
-- already updates ALL descendants in one statement, so when the
-- cascaded UPDATE re-fires this trigger on each child, we skip the
-- redundant work.

CREATE OR REPLACE FUNCTION cascade_close_subtasks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tasks
  SET status = NEW.status,
      completed_at = NEW.completed_at,
      updated_at = NOW()
  WHERE id IN (
    WITH RECURSIVE descendants AS (
      SELECT id FROM tasks
      WHERE parent_task_id = NEW.id AND status = 'open'
      UNION
      SELECT t.id FROM tasks t
      JOIN descendants d ON t.parent_task_id = d.id
      WHERE t.status = 'open'
    )
    SELECT id FROM descendants
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_cascade_close ON tasks;
CREATE TRIGGER tasks_cascade_close
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN (
  OLD.status = 'open'
  AND NEW.status IN ('done', 'cancelled')
  AND pg_trigger_depth() < 2
)
EXECUTE FUNCTION cascade_close_subtasks();
