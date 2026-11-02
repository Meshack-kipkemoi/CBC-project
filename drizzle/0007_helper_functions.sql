create or replace function public.is_principal_of(p_user_id uuid, p_school_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = p_user_id
      and r.name = 'principal'
      and ur.school_id = p_school_id
  );
$$;

create or replace function public.is_principal_of_stream(p_user_id uuid, p_stream_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from streams s
    join grades g on g.id = s.grade_id
    where s.id = p_stream_id
      and is_principal_of(p_user_id, g.school_id)
  );
$$;

-- Used by parent_students: resolves the student's school inside the function,
-- so the policy itself never touches `students`.
create or replace function public.student_school(p_student_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select school_id from students where id = p_student_id;
$$;

create or replace function public.is_verified_parent_of(p_user_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from parent_students ps
    where ps.parent_id = p_user_id
      and ps.student_id = p_student_id
      and ps.verification_status = 'verified'
  );
$$;

create or replace function public.is_class_teacher_of_student(p_user_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from student_enrollments se
    join class_teacher_assignments cta
      on cta.stream_id = se.stream_id
     and cta.academic_year_id = se.academic_year_id
    where se.student_id = p_student_id
      and cta.teacher_id = p_user_id
  );
$$;

create or replace function public.is_subject_teacher_of_student(p_user_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from student_enrollments se
    join subject_teacher_assignments sta
      on sta.stream_id = se.stream_id
     and sta.academic_year_id = se.academic_year_id
    where se.student_id = p_student_id
      and sta.teacher_id = p_user_id
  );
$$;

create or replace function public.is_class_teacher_of_stream(p_user_id uuid, p_stream_id uuid, p_year_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_teacher_assignments cta
    where cta.teacher_id = p_user_id
      and cta.stream_id = p_stream_id
      and cta.academic_year_id = p_year_id
  );
$$;

create or replace function public.is_subject_teacher_of_stream(p_user_id uuid, p_stream_id uuid, p_year_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subject_teacher_assignments sta
    where sta.teacher_id = p_user_id
      and sta.stream_id = p_stream_id
      and sta.academic_year_id = p_year_id
  );
$$;