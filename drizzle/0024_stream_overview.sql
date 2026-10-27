-- Who may open the Streams page? Also usable to hide the sidebar link.
create or replace function public.streams_access()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = (select auth.uid()) and r.name = 'principal'
    ) then 'principal'
    when exists (
      select 1 from class_teacher_assignments cta
      where cta.teacher_id = (select auth.uid())
    ) then 'class_teacher'
  end;
$$;

create or replace function public.streams_overview(
  p_year_id uuid,
  p_term_id uuid default null,
  p_grade_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select (select auth.uid()) as uid
  ),
  yr as (
    select id, school_id from academic_years where id = p_year_id
  ),
  is_principal as (
    select exists (
      select 1 from yr, me where is_principal_of(me.uid, yr.school_id)
    ) as v
  ),
  -- Streams the caller is class teacher of in this year
  mine as (
    select cta.stream_id
    from class_teacher_assignments cta, me
    where cta.teacher_id = me.uid and cta.academic_year_id = p_year_id
  ),
  -- Principal: whole school. Class teacher: every stream of the grades they teach.
  visible_all as (
    select s.id, s.name, s.grade_id, g.name as grade_name, g.level as grade_level
    from streams s
    join grades g on g.id = s.grade_id
    join yr on yr.school_id = g.school_id
    where (select v from is_principal)
       or s.grade_id in (
         select s2.grade_id from streams s2 join mine m on m.stream_id = s2.id
       )
  ),
  visible as (
    select * from visible_all where p_grade_id is null or grade_id = p_grade_id
  ),
  -- One stream per student per year: the latest enrollment
  latest as (
    select distinct on (se.student_id) se.student_id, se.stream_id
    from student_enrollments se
    where se.academic_year_id = p_year_id
    order by se.student_id, se.start_date desc, se.created_at desc
  ),
  res as (
    select l.stream_id, a.term_id, a.learning_area_id, r.grade,
           (r.score / a.max_score * 100) as pct
    from latest l
    join visible v on v.id = l.stream_id
    join student_results r on r.student_id = l.student_id
    join assessments a on a.id = r.assessment_id
    where a.academic_year_id = p_year_id
      and a.status <> 'draft'
  ),
  res_term as (
    select * from res where p_term_id is null or term_id = p_term_id
  ),
  learners as (
    select l.stream_id, count(*) as n
    from latest l join visible v on v.id = l.stream_id
    group by l.stream_id
  ),
  agg as (
    select stream_id,
           count(*) as n,
           round(avg(pct)::numeric, 1) as avg_pct,
           count(*) filter (where grade = 'EE') as ee,
           count(*) filter (where grade = 'ME') as me,
           count(*) filter (where grade = 'AE') as ae,
           count(*) filter (where grade = 'BE') as be
    from res_term
    group by stream_id
  ),
  teachers as (
    select cta.stream_id, string_agg(p.full_name, ', ' order by p.full_name) as names
    from class_teacher_assignments cta
    join profiles p on p.id = cta.teacher_id
    where cta.academic_year_id = p_year_id
    group by cta.stream_id
  ),
  subj as (
    select r.stream_id, la.id as la_id, la.name, la.code,
           round(avg(r.pct)::numeric, 1) as avg_pct, count(*) as n
    from res_term r
    join learning_areas la on la.id = r.learning_area_id
    group by r.stream_id, la.id, la.name, la.code
  ),
  -- Not filtered by term: the trend always covers the whole year
  trend as (
    select r.stream_id, t.id as term_id, t.term_number,
           round(avg(r.pct)::numeric, 1) as avg_pct
    from res r
    join terms t on t.id = r.term_id
    group by r.stream_id, t.id, t.term_number
  )
  select jsonb_build_object(
    'grades', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', g.grade_id, 'name', g.grade_name)
        order by g.grade_level
      )
      from (select distinct grade_id, grade_name, grade_level from visible_all) g
    ), '[]'::jsonb),
    'streams', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'name', v.name,
          'grade_id', v.grade_id,
          'grade_name', v.grade_name,
          'is_mine', exists (select 1 from mine m where m.stream_id = v.id),
          'teacher', (select t.names from teachers t where t.stream_id = v.id),
          'learners', coalesce(ln.n, 0),
          'results', coalesce(ag.n, 0),
          'average', ag.avg_pct,
          'levels', jsonb_build_object(
            'EE', coalesce(ag.ee, 0), 'ME', coalesce(ag.me, 0),
            'AE', coalesce(ag.ae, 0), 'BE', coalesce(ag.be, 0)
          )
        )
        order by v.grade_level, v.name
      )
      from visible v
      left join learners ln on ln.stream_id = v.id
      left join agg ag on ag.stream_id = v.id
    ), '[]'::jsonb),
    'subjects', coalesce((
      select jsonb_agg(jsonb_build_object(
        'stream_id', stream_id, 'id', la_id, 'name', name, 'code', code,
        'average', avg_pct, 'results', n
      )) from subj
    ), '[]'::jsonb),
    'trend', coalesce((
      select jsonb_agg(jsonb_build_object(
        'stream_id', stream_id, 'term_id', term_id,
        'term_number', term_number, 'average', avg_pct
      )) from trend
    ), '[]'::jsonb)
  );
$$;

-- These bypass RLS, so only signed-in users may call them
revoke all on function public.streams_access() from public, anon;
revoke all on function public.streams_overview(uuid, uuid, uuid) from public, anon;
grant execute on function public.streams_access() to authenticated;
grant execute on function public.streams_overview(uuid, uuid, uuid) to authenticated;