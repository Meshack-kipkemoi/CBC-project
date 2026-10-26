create or replace function public.is_class_teacher_of_school(p_user_id uuid, p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from class_teacher_assignments cta
    join academic_years ay on ay.id = cta.academic_year_id
    where cta.teacher_id = p_user_id
      and ay.school_id = p_school_id
  );
$$;

create or replace function public.is_subject_teacher_of_school(p_user_id uuid, p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from subject_teacher_assignments sta
    join academic_years ay on ay.id = sta.academic_year_id
    where sta.teacher_id = p_user_id
      and ay.school_id = p_school_id
  );
$$;

create or replace function public.is_verified_parent_of_school(p_user_id uuid, p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from parent_students ps
    join students s on s.id = ps.student_id
    where ps.parent_id = p_user_id
      and ps.verification_status = 'verified'
      and s.school_id = p_school_id
  );
$$;