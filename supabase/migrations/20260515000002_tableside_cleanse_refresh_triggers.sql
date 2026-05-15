-- Add cleanse_moment and refresh_moment to tableside_triggers.trigger_type check constraint.
--
-- The two new courses (The Cleanse, The Refresh) have kitchen overlay triggers
-- but the CHECK constraint still only listed the original four types, causing
-- every insert for these cards to fail with a constraint violation.

ALTER TABLE public.tableside_triggers
  DROP CONSTRAINT tableside_triggers_trigger_type_check;

ALTER TABLE public.tableside_triggers
  ADD CONSTRAINT tableside_triggers_trigger_type_check
  CHECK (trigger_type IN (
    'pour_moment',
    'bite_moment',
    'cleanse_moment',
    'refresh_moment',
    'butter_pour',
    'dessert_reveal'
  ));

COMMENT ON COLUMN public.tableside_triggers.trigger_type IS
  'pour_moment=pour | bite_moment=bite | cleanse_moment=cleanse | refresh_moment=agua | butter_pour=cut | dessert_reveal=finish';
