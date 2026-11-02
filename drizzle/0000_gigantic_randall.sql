CREATE TYPE "public"."assessment_type" AS ENUM('Classroom Assessment', 'School Based Assessment', 'National Examinations');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('principal', 'class_teacher', 'teacher', 'parent');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('active', 'transferred', 'graduated', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_school_name_unique" UNIQUE("school_id","name"),
	CONSTRAINT "academic_years_valid_date_range" CHECK ("academic_years"."start_date" <= "academic_years"."end_date")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"learning_area_id" uuid NOT NULL,
	"name" text NOT NULL,
	"assessment_type" "assessment_type" NOT NULL,
	"max_score" numeric(8, 2) NOT NULL,
	"status" "assessment_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_max_score_check" CHECK ("assessments"."max_score" > 0)
);
--> statement-breakpoint
CREATE TABLE "class_teacher_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	CONSTRAINT "class_teacher_assignments_stream_id_academic_year_id_unique" UNIQUE("stream_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT "grades_school_id_level_unique" UNIQUE("school_id","level"),
	CONSTRAINT "grades_level_check" CHECK ("grades"."level" between 7 and 9)
);
--> statement-breakpoint
CREATE TABLE "grading_scales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"min_score" numeric(8, 2) NOT NULL,
	"max_score" numeric(8, 2) NOT NULL,
	"grade" text NOT NULL,
	"remark" text,
	CONSTRAINT "grading_scale_range_check" CHECK ("grading_scales"."min_score" <= "grading_scales"."max_score")
);
--> statement-breakpoint
CREATE TABLE "learning_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "learning_areas_school_id_code_unique" UNIQUE("school_id","code")
);
--> statement-breakpoint
CREATE TABLE "parent_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parent_students_parent_id_student_id_unique" UNIQUE("parent_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "app_role" NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grade_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "streams_grade_id_name_unique" UNIQUE("grade_id","name")
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enrollment_dates_check" CHECK ("student_enrollments"."end_date" is null or "student_enrollments"."start_date" <= "student_enrollments"."end_date")
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"score" numeric(8, 2) NOT NULL,
	"grade" text,
	"remark" text,
	"entered_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_results_assessment_id_student_id_unique" UNIQUE("assessment_id","student_id"),
	CONSTRAINT "student_result_score_nonnegative" CHECK ("student_results"."score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"admission_number" text NOT NULL,
	"full_name" text NOT NULL,
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_school_id_admission_number_unique" UNIQUE("school_id","admission_number")
);
--> statement-breakpoint
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subject_teacher_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"learning_area_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	CONSTRAINT "subject_teacher_assignments_teacher_id_stream_id_learning_area_id_academic_year_id_unique" UNIQUE("teacher_id","stream_id","learning_area_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_number" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "terms_academic_year_id_term_number_unique" UNIQUE("academic_year_id","term_number"),
	CONSTRAINT "terms_number_check" CHECK ("terms"."term_number" between 1 and 3),
	CONSTRAINT "terms_dates_check" CHECK ("terms"."start_date" <= "terms"."end_date")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_school_id_unique" UNIQUE("user_id","role_id","school_id")
);
--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_learning_area_id_learning_areas_id_fk" FOREIGN KEY ("learning_area_id") REFERENCES "public"."learning_areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_areas" ADD CONSTRAINT "learning_areas_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streams" ADD CONSTRAINT "streams_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_entered_by_profiles_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_learning_area_id_learning_areas_id_fk" FOREIGN KEY ("learning_area_id") REFERENCES "public"."learning_areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_years_school_dates_idx" ON "academic_years" USING btree ("school_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "class_teacher_user_idx" ON "class_teacher_assignments" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "parent_students_parent_idx" ON "parent_students" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "parent_students_student_idx" ON "parent_students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_student_year_idx" ON "student_enrollments" USING btree ("student_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_stream_year_idx" ON "student_enrollments" USING btree ("stream_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "student_results_student_idx" ON "student_results" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_results_assessment_idx" ON "student_results" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "students_school_idx" ON "students" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "subject_teacher_user_idx" ON "subject_teacher_assignments" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "students_select_principal" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from user_roles ur
      join roles r on r.id = ur.role_id
      where ur.user_id = (select auth.uid())
        and r.name = 'principal'
        and ur.school_id = students.school_id
    ));--> statement-breakpoint
CREATE POLICY "students_select_class_teacher" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from class_teacher_assignments cta
      join student_enrollments se
        on se.stream_id = cta.stream_id
       and se.academic_year_id = cta.academic_year_id
      where cta.teacher_id = (select auth.uid())
        and se.student_id = students.id
    ));--> statement-breakpoint
CREATE POLICY "students_select_subject_teacher" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from subject_teacher_assignments sta
      join student_enrollments se
        on se.stream_id = sta.stream_id
       and se.academic_year_id = sta.academic_year_id
      where sta.teacher_id = (select auth.uid())
        and se.student_id = students.id
    ));--> statement-breakpoint
CREATE POLICY "students_select_parent" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
      select 1 from parent_students ps
      where ps.parent_id = (select auth.uid())
        and ps.student_id = students.id
        and ps.verification_status = 'verified'
    ));