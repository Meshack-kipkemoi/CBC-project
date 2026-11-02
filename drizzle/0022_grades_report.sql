create or replace function public.grades_report(
  p_year_id uuid default null,
  p_term_id uuid default null,
  p_stream_ids uuid[] default null,
  p_pairs jsonb default null
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select
      sr.student_id,
      st.full_name,
      st.admission_number,
      sr.grade as band,
      (sr.score / a.max_score * 100)::float8 as percent,
      la.code as area_code,
      la.name as area_name,
      t.id as term_id,
      t.term_number,
      ay.name as year_name,
      s.id as stream_id,
      s.name as stream_name,
      g.level as grade_level,
      g.name as grade_name
    from student_results sr
    join assessments a on a.id = sr.assessment_id and a.status = 'published'
    join academic_years ay on ay.id = a.academic_year_id
    join terms t on t.id = a.term_id
    join learning_areas la on la.id = a.learning_area_id
    join students st on st.id = sr.student_id
    -- the stream the student was in for that year (their latest enrollment)
    join lateral (
      select e.stream_id
      from student_enrollments e
      where e.student_id = sr.student_id
        and e.academic_year_id = a.academic_year_id
      order by e.start_date desc
      limit 1
    ) se on true
    join streams s on s.id = se.stream_id
    join grades g on g.id = s.grade_id
    where a.academic_year_id = coalesce(
            p_year_id,
            (select id from academic_years order by start_date desc limit 1)
          )
      and (p_stream_ids is null or s.id = any (p_stream_ids))
      and (
        p_pairs is null
        or exists (
          select 1
          from jsonb_to_recordset(p_pairs)
            as x(stream_id uuid, learning_area_id uuid)
          where x.stream_id = s.id
            and x.learning_area_id = a.learning_area_id
        )
      )
  ),
  -- same as base, but narrowed to one term when a term is chosen
  scoped as (
    select * from base where p_term_id is null or term_id = p_term_id
  )
  select jsonb_build_object(
    'summary', (
      select jsonb_build_object(
        'results', count(*),
        'students', count(distinct student_id),
        'average', round(avg(percent)::numeric, 1)
      )
      from scoped
    ),

    'bySubject', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.average desc), '[]'::jsonb)
      from (
        select
          area_code as code,
          area_name as name,
          round(avg(percent)::numeric, 1) as average,
          count(*) as results,
          count(*) filter (where band = 'EE') as ee,
          count(*) filter (where band = 'ME') as me,
          count(*) filter (where band = 'AE') as ae,
          count(*) filter (where band = 'BE') as be
        from scoped
        group by area_code, area_name
      ) r
    ),

    'byGrade', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r.level), '[]'::jsonb)
      from (
        select
          grade_level as level,
          grade_name as name,
          round(avg(percent)::numeric, 1) as average,
          count(distinct student_id) as students
        from scoped
        group by grade_level, grade_name
      ) r
    ),

    'byStream', (
      select coalesce(
        jsonb_agg(to_jsonb(r) order by r."gradeLevel", r."streamName"),
        '[]'::jsonb
      )
      from (
        select
          stream_id as "streamId",
          stream_name as "streamName",
          grade_level as "gradeLevel",
          grade_name as "gradeName",
          round(avg(percent)::numeric, 1) as average,
          count(distinct student_id) as students
        from scoped
        group by stream_id, stream_name, grade_level, grade_name
      ) r
    ),

    -- the trend ignores the term filter so the chart always shows every term
    'byTerm', (
      select coalesce(jsonb_agg(to_jsonb(r) order by r."termNumber"), '[]'::jsonb)
      from (
        select
          term_id as "termId",
          term_number as "termNumber",
          year_name as "year",
          round(avg(percent)::numeric, 1) as average,
          count(*) as results
        from base
        group by term_id, term_number, year_name
      ) r
    ),

    'topStudents', (
      select coalesce(
        jsonb_agg(to_jsonb(r) order by r.average desc, r.name),
        '[]'::jsonb
      )
      from (
        select
          student_id as id,
          full_name as name,
          admission_number as "admissionNumber",
          stream_name as "streamName",
          grade_name as "gradeName",
          round(avg(percent)::numeric, 1) as average,
          count(*) as results
        from scoped
        group by student_id, full_name, admission_number, stream_name, grade_name
        order by avg(percent) desc, full_name
        limit 5
      ) r
    ),

    'supportStudents', (
      select coalesce(
        jsonb_agg(to_jsonb(r) order by r.average asc, r.name),
        '[]'::jsonb
      )
      from (
        select
          student_id as id,
          full_name as name,
          admission_number as "admissionNumber",
          stream_name as "streamName",
          grade_name as "gradeName",
          round(avg(percent)::numeric, 1) as average,
          count(*) as results
        from scoped
        group by student_id, full_name, admission_number, stream_name, grade_name
        order by avg(percent) asc, full_name
        limit 5
      ) r
    )
  );
$$;

revoke execute on function public.grades_report(uuid, uuid, uuid[], jsonb)
  from public, anon;
grant execute on function public.grades_report(uuid, uuid, uuid[], jsonb)
  to authenticated;