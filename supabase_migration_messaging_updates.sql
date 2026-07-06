-- Migration: Add fields to chat_threads table to support soft delete and mark as unread features
-- Generated: 2026-07-06

ALTER TABLE chat_threads
  ADD COLUMN IF NOT EXISTS employer_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS worker_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS employer_marked_unread BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS worker_marked_unread BOOLEAN NOT NULL DEFAULT FALSE;
