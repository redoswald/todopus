-- Strip Maestro AI chat (reverses 005_maestro_chat.sql)
-- The embedded chat was replaced by the MCP-first approach: users connect
-- their own AI via the Intend MCP server, so the app stores no API keys
-- and keeps no chat history.

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS user_settings;
