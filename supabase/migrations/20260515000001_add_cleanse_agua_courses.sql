-- ============================================================
-- Add 'cleanse' and 'agua' to the photos.course CHECK constraint.
--
-- The menu was extended with two new courses (The Cleanse and
-- The Refresh) but the photos table still rejected those values,
-- which made uploads on those cards fail server-side with a
-- check constraint violation.
-- ============================================================

alter table public.photos
  drop constraint if exists photos_course_check;

alter table public.photos
  add constraint photos_course_check
  check (course in ('guest', 'pour', 'bite', 'cleanse', 'agua', 'cut', 'finish', 'booth'));
