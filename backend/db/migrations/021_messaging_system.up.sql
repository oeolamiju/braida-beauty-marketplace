-- Messaging System

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  client_unread_count INTEGER NOT NULL DEFAULT 0,
  freelancer_unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, freelancer_id, booking_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_freelancer ON conversations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

