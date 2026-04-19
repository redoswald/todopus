-- One-shot backfill: close any open task whose parent (or transitive
-- ancestor) is already done/cancelled. These accumulated before the
-- cascade trigger in 011 existed.
--
-- Each orphan inherits its nearest closed ancestor's status and
-- completed_at, matching the user's mental model ("I just didn't
-- tick these, the work is effectively done").

WITH RECURSIVE descendants_to_close AS (
  SELECT
    c.id,
    p.status       AS tgt_status,
    COALESCE(p.completed_at, NOW()) AS tgt_completed_at
  FROM tasks c
  JOIN tasks p ON p.id = c.parent_task_id
  WHERE p.status IN ('done', 'cancelled')
    AND c.status = 'open'

  UNION

  SELECT
    c.id,
    d.tgt_status,
    d.tgt_completed_at
  FROM tasks c
  JOIN descendants_to_close d ON d.id = c.parent_task_id
  WHERE c.status = 'open'
)
UPDATE tasks t
SET status = d.tgt_status,
    completed_at = d.tgt_completed_at,
    updated_at = NOW()
FROM descendants_to_close d
WHERE t.id = d.id;
