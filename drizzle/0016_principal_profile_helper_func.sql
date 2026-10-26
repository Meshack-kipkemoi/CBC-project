create or replace function public.is_principal_of_profile(p_user_id uuid, p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles target
    join user_roles me on me.school_id = target.school_id
    join roles r on r.id = me.role_id
    where target.user_id = p_profile_id
      and me.user_id = p_user_id
      and r.name = 'principal'
  );
$$;