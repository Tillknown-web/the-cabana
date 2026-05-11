-- Expand tableside_triggers.trigger_type to support all four course moments:
-- butter_pour (cut), dessert_reveal (finish), pour_moment (pour), bite_moment (bite)

ALTER TABLE public.tableside_triggers
  DROP CONSTRAINT tableside_triggers_trigger_type_check;

ALTER TABLE public.tableside_triggers
  ADD CONSTRAINT tableside_triggers_trigger_type_check
  CHECK (trigger_type IN ('butter_pour', 'dessert_reveal', 'pour_moment', 'bite_moment'));

COMMENT ON COLUMN public.tableside_triggers.trigger_type IS
  'butter_pour=cut card | dessert_reveal=finish card | pour_moment=pour card | bite_moment=bite card';
