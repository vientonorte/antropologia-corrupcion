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

-- Uploads table for storing document metadata and processing state
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  caso_id INTEGER NOT NULL CHECK(caso_id IN (1, 2, 3, 4)),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  hash_source TEXT NOT NULL UNIQUE,
  fuente_tipo TEXT NOT NULL CHECK(fuente_tipo IN ('documento_oficial', 'prensa', 'testimonio', 'red_social', 'archivo_propio', 'otro')),
  regimen_verdad TEXT NOT NULL CHECK(regimen_verdad IN ('juridico', 'mediatico', 'institucional', 'testimonial')),
  tags TEXT,
  estado_codificacion TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado_codificacion IN ('pendiente', 'open', 'axial', 'selective', 'verificado')),
  fecha_evento TEXT,
  transcription TEXT,
  analysis TEXT,
  codes TEXT,
  mistranslations TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES credentials(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_name ON credentials(user_name);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_caso_id ON uploads(caso_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_uploads_estado ON uploads(estado_codificacion);
