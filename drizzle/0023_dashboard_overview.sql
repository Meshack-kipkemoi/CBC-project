create or replace function public.dashboard_overview(
  p_year_id uuid,
  p_term_id uuid default null,
  p_grade_id uuid default null,
  p_stream_id uuid default null,
  p_below_threshold numeric default 40
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  -- One class per student per year: the latest enrollment (handles stream transfers)
  with latest as (
    select distinct on (se.student_id)
      se.student_id, se.stream_id, s.grade_id
    from student_enrollments se
    join streams s on s.id = se.stream_id
    where se.academic_year_id = p_year_id
    order by se.student_id, se.start_date desc, se.created_at desc
  ),
  scope as (
    select * from latest
    where (p_grade_id is null or grade_id = p_grade_id)
      and (p_stream_id is null or stream_id = p_stream_id)
  ),
  res as (
    select sc.stream_id, a.term_id, (r.score / a.max_score * 100) as pct
    from scope sc
    join student_results r on r.student_id = sc.student_id
    join assessments a on a.id = r.assessment_id
    where a.academic_year_id = p_year_id
      and a.status <> 'draft'
  ),
  res_term as (
    select * from res where p_term_id is null or term_id = p_term_id
  ),
  class_avg as (
    select stream_id, avg(pct) as avg_pct from res_term group by stream_id
  ),
  by_class as (
    select
      case when p_grade_id is null then g.id else st.id end as id,
      case when p_grade_id is null then g.name else st.name end as label,
      count(*) as learners
    from scope sc
    join streams st on st.id = sc.stream_id
    join grades g on g.id = st.grade_id
    group by 1, 2
  ),
  asm as (
    select count(*) as total, count(*) filter (where status <> 'draft') as published
    from assessments
    where academic_year_id = p_year_id
      and (p_term_id is null or term_id = p_term_id)
  ),
  trend as (
    select t.id, t.term_number,
           round(avg(r.pct)::numeric, 1) as avg_pct,
           count(r.pct) as n
    from terms t
    left join res r on r.term_id = t.id
    where t.academic_year_id = p_year_id
    group by t.id, t.term_number
  )
  select jsonb_build_object(
    'learners', (select count(*) from scope),
    'average',  (select round(avg(pct)::numeric, 1) from res_term),
    'results',  (select count(*) from res_term),
    'assessments', (select jsonb_build_object('total', total, 'published', published) from asm),
    'classes', jsonb_build_object(
      'total', (select count(*) from class_avg),
      'below', (select count(*) from class_avg where avg_pct < p_below_threshold)
    ),
    'by_class', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'label', label, 'learners', learners)
        order by label
      ) from by_class
    ), '[]'::jsonb),
    'trend', coalesce((
      select jsonb_agg(
        jsonb_build_object('term_id', id, 'term_number', term_number, 'average', avg_pct, 'results', n)
        order by term_number
      ) from trend
    ), '[]'::jsonb)
  );
$$;