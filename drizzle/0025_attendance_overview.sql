-- ---------- Attendance tables ----------
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');

create table public.attendance_sessions (
  id uuid not null default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  academic_year_id uuid not null references public.academic_years(id),
  term_id uuid not null references public.terms(id),
  stream_id uuid not null references public.streams(id),
  learning_area_id uuid references public.learning_areas(id), -- null = class/homeroom session
  session_date date not null,
  taken_by uuid not null references public.profiles(id),
  created_at timestamp with time zone not null default now(),
  constraint attendance_sessions_pkey primary key (id)
);

create table public.attendance_records (
  id uuid not null default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id),
  status public.attendance_status not null,
  note text,
  constraint attendance_records_pkey primary key (id),
  constraint attendance_records_session_student_key unique (session_id, student_id)
);

create index attendance_sessions_year_idx on public.attendance_sessions (academic_year_id, stream_id);
create index attendance_records_session_idx on public.attendance_records (session_id);

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

-- Adjust the school-scoping to match your existing RLS helpers.
create policy "attendance sessions: school members"
  on public.attendance_sessions for select to authenticated
  using (exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid() and ur.school_id = attendance_sessions.school_id));

create policy "attendance sessions: assigned teachers insert"
  on public.attendance_sessions for insert to authenticated
  with check (
    taken_by = auth.uid()
    and exists (
      select 1 from class_teacher_assignments cta
      where cta.stream_id = attendance_sessions.stream_id
        and cta.teacher_id = auth.uid()
        and cta.academic_year_id = attendance_sessions.academic_year_id)
    or exists (
      select 1 from subject_teacher_assignments sta
      where sta.stream_id = attendance_sessions.stream_id
        and sta.teacher_id = auth.uid()
        and sta.academic_year_id = attendance_sessions.academic_year_id));

create policy "attendance records: school members"
  on public.attendance_records for select to authenticated
  using (exists (
    select 1 from attendance_sessions s
    join user_roles ur on ur.school_id = s.school_id
    where s.id = attendance_records.session_id and ur.user_id = auth.uid()));

-- ---------- Access ----------
create or replace function public.attendance_access()
returns text
language sql stable security definer set search_path = public
as $$
  select case
    when exists (
      select 1 from user_roles ur join roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name::text = 'principal'
    ) then 'principal'
    when exists (
      select 1 from class_teacher_assignments cta
      join academic_years ay on ay.id = cta.academic_year_id
      where cta.teacher_id = auth.uid()
        and ay.start_date <= current_date and current_date <= ay.end_date
    ) then 'class_teacher'
    when exists (
      select 1 from subject_teacher_assignments sta
      join academic_years ay on ay.id = sta.academic_year_id
      where sta.teacher_id = auth.uid()
        and ay.start_date <= current_date and current_date <= ay.end_date
    ) then 'subject_teacher'
    else null
  end;
$$;

-- ---------- Overview ----------
create or replace function public.attendance_overview(
  p_year_id uuid,
  p_term_id uuid default null,
  p_grade_id uuid default null,
  p_learning_area_id uuid default null
)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
  v_role text := public.attendance_access();
  v_uid uuid := auth.uid();
  v_result json;
begin
  if v_role is null then
    return null;
  end if;

  with allowed as (
    select s.id, s.name, s.grade_id, g.name as grade_name, g.level,
      (v_role = 'class_teacher' and exists (
        select 1 from class_teacher_assignments cta
        where cta.stream_id = s.id and cta.teacher_id = v_uid
          and cta.academic_year_id = p_year_id)) as is_mine,
      (select p.full_name from class_teacher_assignments cta
        join profiles p on p.id = cta.teacher_id
        where cta.stream_id = s.id and cta.academic_year_id = p_year_id
        limit 1) as teacher
    from streams s
    join grades g on g.id = s.grade_id
    join academic_years ay on ay.id = p_year_id
    where g.school_id = ay.school_id
      and (
        v_role = 'principal'
        or (v_role = 'class_teacher' and exists (
          select 1 from class_teacher_assignments cta
          where cta.stream_id = s.id and cta.teacher_id = v_uid
            and cta.academic_year_id = p_year_id))
        or (v_role = 'subject_teacher' and exists (
          select 1 from subject_teacher_assignments sta
          where sta.stream_id = s.id and sta.teacher_id = v_uid
            and sta.academic_year_id = p_year_id))
      )
      and (v_role <> 'principal' or p_grade_id is null or s.grade_id = p_grade_id)
  ),
  sessions as (
    select ses.id, ses.stream_id, ses.term_id
    from attendance_sessions ses
    join allowed a on a.id = ses.stream_id
    where ses.academic_year_id = p_year_id
      and (p_term_id is null or ses.term_id = p_term_id)
      and (
        v_role <> 'subject_teacher'
        or (p_learning_area_id is not null and ses.learning_area_id = p_learning_area_id)
        or (p_learning_area_id is null and (
          ses.learning_area_id is null
          or exists (
            select 1 from subject_teacher_assignments sta
            where sta.teacher_id = v_uid and sta.academic_year_id = p_year_id
              and sta.stream_id = ses.stream_id
              and sta.learning_area_id = ses.learning_area_id)))
      )
  ),
  rec_counts as (
    select c.stream_id,
      count(*) as records,
      count(distinct c.id) as sessions,
      count(*) filter (where r.status = 'present') as present,
      count(*) filter (where r.status = 'absent') as absent,
      count(*) filter (where r.status = 'late') as late,
      count(*) filter (where r.status = 'excused') as excused
    from sessions c
    join attendance_records r on r.session_id = c.id
    group by c.stream_id
  ),
  learners as (
    select se.stream_id, count(*) as learners
    from student_enrollments se
    join allowed a on a.id = se.stream_id
    where se.academic_year_id = p_year_id and se.end_date is null
    group by se.stream_id
  ),
  trend as (
    select c.stream_id, t.term_number,
      round(100.0 * count(*) filter (where r.status in ('present','late')) / count(*)) as rate
    from sessions c
    join terms t on t.id = c.term_id
    join attendance_records r on r.session_id = c.id
    group by c.stream_id, t.term_number
  )
  select json_build_object(
    'grades', coalesce((
      select json_agg(json_build_object('id', g.id, 'name', g.name) order by g.level)
      from grades g
      join academic_years ay on ay.id = p_year_id and g.school_id = ay.school_id), '[]'::json),
    'learningAreas', coalesce((
      select json_agg(distinct json_build_object('id', la.id, 'name', la.name, 'code', la.code))
      from subject_teacher_assignments sta
      join learning_areas la on la.id = sta.learning_area_id
      where v_role = 'subject_teacher' and sta.teacher_id = v_uid
        and sta.academic_year_id = p_year_id), '[]'::json),
    'streams', coalesce((
      select json_agg(x.j order by x.level, x.name) from (
        select a.level, a.name, json_build_object(
          'id', a.id, 'name', a.name, 'grade_id', a.grade_id, 'grade_name', a.grade_name,
          'is_mine', a.is_mine, 'teacher', a.teacher,
          'learners', coalesce(l.learners, 0),
          'sessions', coalesce(c.sessions, 0),
          'records', coalesce(c.records, 0),
          'present', coalesce(c.present, 0), 'absent', coalesce(c.absent, 0),
          'late', coalesce(c.late, 0), 'excused', coalesce(c.excused, 0)
        ) as j
        from allowed a
        left join rec_counts c on c.stream_id = a.id
        left join learners l on l.stream_id = a.id
      ) x), '[]'::json),
    'trend', coalesce((
      select json_agg(json_build_object(
        'stream_id', t.stream_id, 'term_number', t.term_number, 'rate', t.rate))
      from trend t), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.attendance_access() to authenticated;
grant execute on function public.attendance_overview(uuid, uuid, uuid, uuid) to authenticated;