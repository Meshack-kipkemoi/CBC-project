create or replace function public.is_principal_of(p_user_id uuid, p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = p_user_id
      and r.name = 'principal'
      and ur.school_id = p_school_id
  );
$$;