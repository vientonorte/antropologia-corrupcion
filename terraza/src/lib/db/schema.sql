-- Credentials table for storing passkey public key info
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL UNIQUE,
  credential_id BLOB NOT NULL,
  credential_public_key BLOB NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Challenges table for storing registration and authentication challenges
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  challenge TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK(challenge_type IN ('registration', 'authentication')),
  user_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_name ON credentials(user_name);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
