
-- Reverse attendance tables migration

DROP TABLE IF EXISTS public.attendance_records;
DROP TABLE IF EXISTS public.attendance_sessions;

DROP TYPE IF EXISTS public.attendance_status;
