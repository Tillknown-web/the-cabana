-- Schedule the spotify-poll Edge Function to run every minute via pg_cron + pg_net.
-- pg_net is enabled by default on all Supabase hosted projects.
-- The anon key is safe to embed — it is a public, read-only token.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any pre-existing job with the same name so this migration is idempotent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'spotify-poll') THEN
    PERFORM cron.unschedule('spotify-poll');
  END IF;
END $$;

SELECT cron.schedule(
  'spotify-poll',
  '* * * * *',
  $$
  SELECT net.http_get(
    url     := 'https://zcxqbcjuiustiscowbej.supabase.co/functions/v1/spotify-poll',
    headers := '{"Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjeHFiY2p1aXVzdGlzY293YmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDgwOTIsImV4cCI6MjA5MjIyNDA5Mn0.YusMq52WcjC07TUp3ffHJvRLsn1o8cVWg8SdcmGonXA"}'::jsonb
  ) AS request_id;
  $$
);
