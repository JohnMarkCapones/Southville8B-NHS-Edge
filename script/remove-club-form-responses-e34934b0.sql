-- One-off cleanup: Remove all club form responses (and answers) for a specific user
-- Context: User requested removal of their club form responses
-- Target user_id: e34934b0-d32e-4379-9220-37c56134ddd5

BEGIN;

-- Delete dependent answers first to satisfy FK constraints
DELETE FROM club_form_answers
WHERE response_id IN (
  SELECT id FROM club_form_responses
  WHERE user_id = 'e34934b0-d32e-4379-9220-37c56134ddd5'
);

-- Delete the user's form responses
DELETE FROM club_form_responses
WHERE user_id = 'e34934b0-d32e-4379-9220-37c56134ddd5';

COMMIT;

-- Notes:
-- - Run against Supabase Postgres for the production project.
-- - This operation is irreversible; verify the UUID before executing.


