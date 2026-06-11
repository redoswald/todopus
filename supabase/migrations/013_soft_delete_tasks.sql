-- Soft delete for tasks. Deleting a task sets deleted_at instead of
-- removing the row, so undo can restore the task (and its subtasks,
-- dependencies, and completion history) exactly as it was.
--
-- Mirrors 011_cascade_close_subtasks: a trigger carries deleted_at down
-- to all descendants so "orphan subtasks of a deleted parent" is not a
-- representable state. Restoring a parent (deleted_at -> NULL) restores
-- only the descendants that were deleted in the same batch — i.e. with
-- the identical deleted_at timestamp — so subtasks the user had trashed
-- separately beforehand stay trashed.

ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMPTZ;

-- Partial index: deleted rows are the rare case; live-row queries filter
-- on deleted_at IS NULL and stay on existing indexes.
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE OR REPLACE FUNCTION cascade_soft_delete_subtasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN
    -- Soft-deleting: stamp all live descendants with the same deleted_at
    UPDATE tasks
    SET deleted_at = NEW.deleted_at,
        updated_at = NOW()
    WHERE id IN (
      WITH RECURSIVE descendants AS (
        SELECT id FROM tasks
        WHERE parent_task_id = NEW.id AND deleted_at IS NULL
        UNION
        SELECT t.id FROM tasks t
        JOIN descendants d ON t.parent_task_id = d.id
        WHERE t.deleted_at IS NULL
      )
      SELECT id FROM descendants
    );
  ELSE
    -- Restoring: bring back only descendants deleted in the same batch
    UPDATE tasks
    SET deleted_at = NULL,
        updated_at = NOW()
    WHERE id IN (
      WITH RECURSIVE descendants AS (
        SELECT id FROM tasks
        WHERE parent_task_id = NEW.id AND deleted_at = OLD.deleted_at
        UNION
        SELECT t.id FROM tasks t
        JOIN descendants d ON t.parent_task_id = d.id
        WHERE t.deleted_at = OLD.deleted_at
      )
      SELECT id FROM descendants
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_cascade_soft_delete ON tasks;
CREATE TRIGGER tasks_cascade_soft_delete
AFTER UPDATE OF deleted_at ON tasks
FOR EACH ROW
WHEN (
  OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
  AND pg_trigger_depth() < 2
)
EXECUTE FUNCTION cascade_soft_delete_subtasks();
