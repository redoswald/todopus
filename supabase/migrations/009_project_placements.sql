-- Per-user project hierarchy: each user can organize shared projects
-- independently without affecting other users' views.

CREATE TABLE project_placements (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, project_id)
);

CREATE INDEX idx_placements_user ON project_placements(user_id);

ALTER TABLE project_placements ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own placements
CREATE POLICY "Users can manage own placements"
    ON project_placements FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Seed placements for the project owner from existing projects.parent_id/sort_order
-- so existing hierarchies are preserved when we start reading from placements.
INSERT INTO project_placements (user_id, project_id, parent_id, sort_order)
SELECT owner_id, id, parent_id, sort_order
FROM projects
WHERE is_archived = false;

-- Seed placements for existing shared users (top-level, sort_order 0)
INSERT INTO project_placements (user_id, project_id, parent_id, sort_order)
SELECT ps.shared_with_user_id, ps.project_id, NULL, 0
FROM project_shares ps
ON CONFLICT DO NOTHING;
