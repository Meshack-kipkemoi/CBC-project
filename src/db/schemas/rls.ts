import { sql } from "drizzle-orm";

export const uid = sql`(select auth.uid())`;

// True if the current user is principal of the school that owns this stream.
// `streamCol` is a trusted column reference like "student_enrollments.stream_id".
export const isPrincipalOfStream = (streamCol: string) => sql`exists (
  select 1 from streams s
  join grades g on g.id = s.grade_id
  join user_roles ur on ur.school_id = g.school_id
  join roles r on r.id = ur.role_id
  where s.id = ${sql.raw(streamCol)}
    and ur.user_id = ${uid}
    and r.name = 'principal'
)`;
