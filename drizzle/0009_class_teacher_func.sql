-- True when the user is a class teacher of ANY stream in the same grade the
-- student is enrolled in, for the same academic year (8 West teacher -> 8 East students).
create or replace function public.is_class_teacher_of_student_grade(p_user_id uuid, p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from class_teacher_assignments cta
    join streams teacher_stream on teacher_stream.id = cta.stream_id
    join student_enrollments se
      on se.academic_year_id = cta.academic_year_id
     and se.student_id = p_student_id
    join streams student_stream on student_stream.id = se.stream_id
    where cta.teacher_id = p_user_id
      and student_stream.grade_id = teacher_stream.grade_id
  );
$$;