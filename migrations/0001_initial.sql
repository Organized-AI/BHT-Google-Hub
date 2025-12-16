-- Google Marketing Hub MCP - Initial Schema
-- Tokens table for OAuth 2.0 token storage

CREATE TABLE IF NOT EXISTS tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  scopes TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Index for token expiry queries
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
