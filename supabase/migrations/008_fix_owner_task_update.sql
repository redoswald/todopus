-- Fix: project owners should be able to update/delete any task in their project,
-- not just tasks they personally created.

-- Update tasks in projects the user owns (regardless of task owner_id)
CREATE POLICY "Project owners can modify any task in their projects"
    ON tasks FOR UPDATE
    USING (
        project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.owner_id = auth.uid()
        )
    );

-- Delete tasks in projects the user owns
CREATE POLICY "Project owners can delete any task in their projects"
    ON tasks FOR DELETE
    USING (
        project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.owner_id = auth.uid()
        )
    );
