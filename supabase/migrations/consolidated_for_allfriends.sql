-- =============================================================================
-- Todopus Schema - Consolidated Migration for All_Friends Supabase
-- =============================================================================
-- This combines all 5 Todopus migrations into a single script, with
-- modifications to handle_new_user() for idempotency and Google OAuth.
--
-- Safe to run in All_Friends' Supabase: no table name conflicts
-- (All_Friends uses PascalCase Prisma tables, Todopus uses snake_case).
-- =============================================================================

-- =============================================================================
-- STEP 1: CREATE ALL TABLES
-- =============================================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#808080',
    sort_order INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    todoist_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_parent ON projects(parent_id);
CREATE INDEX idx_projects_todoist_id ON projects(todoist_id) WHERE todoist_id IS NOT NULL;

-- Share permission enum
CREATE TYPE share_permission AS ENUM ('view', 'edit', 'admin');

-- Project shares
CREATE TABLE project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission share_permission DEFAULT 'view',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, shared_with_user_id)
);

CREATE INDEX idx_project_shares_project ON project_shares(project_id);
CREATE INDEX idx_project_shares_user ON project_shares(shared_with_user_id);

-- Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    todoist_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_project ON sections(project_id);
CREATE INDEX idx_sections_todoist_id ON sections(todoist_id) WHERE todoist_id IS NOT NULL;

-- Task status enum
CREATE TYPE task_status AS ENUM ('open', 'done', 'cancelled');

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'open',
    priority INTEGER DEFAULT 0 CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    due_time TIME,
    deadline DATE,
    recurrence_rule TEXT,
    recurrence_base_date DATE,
    blocked_by UUID REFERENCES tasks(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    todoist_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_owner ON tasks(owner_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_section ON tasks(section_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_tasks_todoist_id ON tasks(todoist_id) WHERE todoist_id IS NOT NULL;

-- Conversations (Maestro AI chat sessions)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- Messages within conversations
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    tool_results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- User settings for Maestro
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    anthropic_api_key TEXT,
    maestro_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: TRIGGERS
-- =============================================================================

-- Auto-create profile on signup (safe for shared Supabase: ON CONFLICT DO NOTHING)
-- Handles Google OAuth metadata (full_name, name) in addition to display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 4: RLS POLICIES
-- =============================================================================

-- PROFILES policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can view shared user profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_shares ps1
            JOIN project_shares ps2 ON ps1.project_id = ps2.project_id
            WHERE ps1.shared_with_user_id = auth.uid()
            AND ps2.shared_with_user_id = profiles.id
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            JOIN project_shares ps ON p.id = ps.project_id
            WHERE p.owner_id = auth.uid()
            AND ps.shared_with_user_id = profiles.id
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            JOIN project_shares ps ON p.id = ps.project_id
            WHERE p.owner_id = profiles.id
            AND ps.shared_with_user_id = auth.uid()
        )
    );

-- PROJECTS policies
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared projects"
    ON projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_shares
            WHERE project_id = projects.id
            AND shared_with_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can update shared projects with edit+"
    ON projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM project_shares
            WHERE project_id = projects.id
            AND shared_with_user_id = auth.uid()
            AND permission IN ('edit', 'admin')
        )
    );

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (owner_id = auth.uid());

-- PROJECT_SHARES policies
CREATE POLICY "Owners can manage shares"
    ON project_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_shares.project_id
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage shares"
    ON project_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_shares ps
            WHERE ps.project_id = project_shares.project_id
            AND ps.shared_with_user_id = auth.uid()
            AND ps.permission = 'admin'
        )
    );

CREATE POLICY "Users can view their own shares"
    ON project_shares FOR SELECT
    USING (shared_with_user_id = auth.uid());

-- SECTIONS policies
CREATE POLICY "Users can view sections of accessible projects"
    ON sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sections.project_id
            AND (
                projects.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_shares
                    WHERE project_shares.project_id = projects.id
                    AND project_shares.shared_with_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can modify sections of editable projects"
    ON sections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = sections.project_id
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

-- TASKS policies (from 002_fix_task_rls.sql - the corrected version)
CREATE POLICY "Users can view own inbox tasks"
    ON tasks FOR SELECT
    USING (owner_id = auth.uid() AND project_id IS NULL);

CREATE POLICY "Users can insert own inbox tasks"
    ON tasks FOR INSERT
    WITH CHECK (owner_id = auth.uid() AND project_id IS NULL);

CREATE POLICY "Users can update own inbox tasks"
    ON tasks FOR UPDATE
    USING (owner_id = auth.uid() AND project_id IS NULL)
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own inbox tasks"
    ON tasks FOR DELETE
    USING (owner_id = auth.uid() AND project_id IS NULL);

CREATE POLICY "Users can view tasks in accessible projects"
    ON tasks FOR SELECT
    USING (
        project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND (
                projects.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_shares
                    WHERE project_shares.project_id = projects.id
                    AND project_shares.shared_with_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can modify own tasks in projects"
    ON tasks FOR ALL
    USING (
        project_id IS NOT NULL
        AND owner_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND (
                projects.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_shares
                    WHERE project_shares.project_id = projects.id
                    AND project_shares.shared_with_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can modify tasks in editable shared projects"
    ON tasks FOR UPDATE
    USING (
        project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND EXISTS (
                SELECT 1 FROM project_shares
                WHERE project_shares.project_id = projects.id
                AND project_shares.shared_with_user_id = auth.uid()
                AND project_shares.permission IN ('edit', 'admin')
            )
        )
    );

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

-- CONVERSATIONS policies
CREATE POLICY "Users can manage own conversations"
    ON conversations FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "Users can manage messages in own conversations"
    ON messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- USER_SETTINGS policies
CREATE POLICY "Users can manage own settings"
    ON user_settings FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
