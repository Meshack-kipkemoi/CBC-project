create or replace function public.is_principal_of_term(p_user_id uuid, p_term_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_principal_of(p_user_id, (
    select ay.school_id from terms t
    join academic_years ay on ay.id = t.academic_year_id
    where t.id = p_term_id
  ));
$$;

create or replace function public.is_class_teacher_of_term(p_user_id uuid, p_term_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_class_teacher_of_school(p_user_id, (
    select ay.school_id from terms t
    join academic_years ay on ay.id = t.academic_year_id
    where t.id = p_term_id
  ));
$$;

create or replace function public.is_subject_teacher_of_term(p_user_id uuid, p_term_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_subject_teacher_of_school(p_user_id, (
    select ay.school_id from terms t
    join academic_years ay on ay.id = t.academic_year_id
    where t.id = p_term_id
  ));
$$;

create or replace function public.is_verified_parent_of_term(p_user_id uuid, p_term_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_verified_parent_of_school(p_user_id, (
    select ay.school_id from terms t
    join academic_years ay on ay.id = t.academic_year_id
    where t.id = p_term_id
  ));
$$;