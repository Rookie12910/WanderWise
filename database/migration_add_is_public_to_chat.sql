-- Add is_public column to group_chat_messages table
ALTER TABLE group_chat_messages ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for faster queries on public messages
CREATE INDEX idx_group_chat_messages_public ON group_chat_messages(group_trip_id, is_public);
