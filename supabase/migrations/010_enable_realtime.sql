-- Enable Supabase Realtime on collaborative tables so changes
-- from one user are broadcast to others viewing the same data.

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE sections;
ALTER PUBLICATION supabase_realtime ADD TABLE project_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE project_placements;
