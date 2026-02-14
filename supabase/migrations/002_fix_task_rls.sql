-- Fix task RLS policies for inbox tasks
-- Run this if you're getting "new row violates row-level security policy" errors

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can access own inbox tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks in editable projects" ON tasks;

-- Create separate, explicit policies for inbox tasks

-- SELECT inbox tasks
CREATE POLICY "Users can view own inbox tasks"
    ON tasks FOR SELECT
    USING (owner_id = auth.uid() AND project_id IS NULL);

-- INSERT inbox tasks
CREATE POLICY "Users can insert own inbox tasks"
    ON tasks FOR INSERT
    WITH CHECK (owner_id = auth.uid() AND project_id IS NULL);

-- UPDATE inbox tasks
CREATE POLICY "Users can update own inbox tasks"
    ON tasks FOR UPDATE
    USING (owner_id = auth.uid() AND project_id IS NULL)
    WITH CHECK (owner_id = auth.uid());

-- DELETE inbox tasks
CREATE POLICY "Users can delete own inbox tasks"
    ON tasks FOR DELETE
    USING (owner_id = auth.uid() AND project_id IS NULL);

-- INSERT tasks into projects (owned or shared with edit permission)
CREATE POLICY "Users can insert tasks in projects"
    ON tasks FOR INSERT
    WITH CHECK (
        owner_id = auth.uid()
        AND project_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND (
                projects.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_shares
                    WHERE project_shares.project_id = projects.id
                    AND project_shares.shared_with_user_id = auth.uid()
                    AND project_shares.permission IN ('edit', 'admin')
                )
            )
        )
    );
