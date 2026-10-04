CREATE TYPE "app_role" AS ENUM('principal', 'class_teacher', 'teacher', 'parent');--> statement-breakpoint
CREATE TYPE "assessment_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "student_status" AS ENUM('active', 'transferred', 'graduated', 'inactive');--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_school_name_unique" UNIQUE("school_id","name"),
	CONSTRAINT "academic_years_valid_date_range" CHECK ("start_date" <= "end_date")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"learning_area_id" uuid NOT NULL,
	"name" text NOT NULL,
	"assessment_type" text NOT NULL,
	"max_score" numeric(8,2) NOT NULL,
	"status" "assessment_status" DEFAULT 'draft'::"assessment_status" NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_max_score_check" CHECK ("max_score" > 0)
);
--> statement-breakpoint
CREATE TABLE "class_teacher_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"teacher_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	CONSTRAINT "class_teacher_assignments_stream_id_academic_year_id_unique" UNIQUE("stream_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT "grades_school_id_level_unique" UNIQUE("school_id","level"),
	CONSTRAINT "grades_level_check" CHECK ("level" between 7 and 9)
);
--> statement-breakpoint
CREATE TABLE "grading_scales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"min_score" numeric(8,2) NOT NULL,
	"max_score" numeric(8,2) NOT NULL,
	"grade" text NOT NULL,
	"remark" text,
	CONSTRAINT "grading_scale_range_check" CHECK ("min_score" <= "max_score")
);
--> statement-breakpoint
CREATE TABLE "learning_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "learning_areas_school_id_code_unique" UNIQUE("school_id","code")
);
--> statement-breakpoint
CREATE TABLE "parent_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"parent_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending'::"verification_status" NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parent_students_parent_id_student_id_unique" UNIQUE("parent_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY,
	"full_name" text NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" "app_role" NOT NULL UNIQUE,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"code" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"grade_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "streams_grade_id_name_unique" UNIQUE("grade_id","name")
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enrollment_dates_check" CHECK ("end_date" is null or "start_date" <= "end_date")
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"assessment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"score" numeric(8,2) NOT NULL,
	"grade" text,
	"remark" text,
	"entered_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_results_assessment_id_student_id_unique" UNIQUE("assessment_id","student_id"),
	CONSTRAINT "student_result_score_nonnegative" CHECK ("score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"school_id" uuid NOT NULL,
	"admission_number" text NOT NULL,
	"full_name" text NOT NULL,
	"status" "student_status" DEFAULT 'active'::"student_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_school_id_admission_number_unique" UNIQUE("school_id","admission_number")
);
--> statement-breakpoint
CREATE TABLE "subject_teacher_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"teacher_id" uuid NOT NULL,
	"stream_id" uuid NOT NULL,
	"learning_area_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	CONSTRAINT "subject_teacher_assignments_teacher_id_stream_id_learning_area_id_academic_year_id_unique" UNIQUE("teacher_id","stream_id","learning_area_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"academic_year_id" uuid NOT NULL,
	"term_number" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "terms_academic_year_id_term_number_unique" UNIQUE("academic_year_id","term_number"),
	CONSTRAINT "terms_number_check" CHECK ("term_number" between 1 and 3),
	CONSTRAINT "terms_dates_check" CHECK ("start_date" <= "end_date")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_school_id_unique" UNIQUE("user_id","role_id","school_id")
);
--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
CREATE INDEX "academic_years_school_dates_idx" ON "academic_years" ("school_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "class_teacher_user_idx" ON "class_teacher_assignments" ("teacher_id");--> statement-breakpoint
CREATE INDEX "parent_students_parent_idx" ON "parent_students" ("parent_id");--> statement-breakpoint
CREATE INDEX "parent_students_student_idx" ON "parent_students" ("student_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_student_year_idx" ON "student_enrollments" ("student_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "student_enrollments_stream_year_idx" ON "student_enrollments" ("stream_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "student_results_student_idx" ON "student_results" ("student_id");--> statement-breakpoint
CREATE INDEX "student_results_assessment_idx" ON "student_results" ("assessment_id");--> statement-breakpoint
CREATE INDEX "students_school_idx" ON "students" ("school_id");--> statement-breakpoint
CREATE INDEX "subject_teacher_user_idx" ON "subject_teacher_assignments" ("teacher_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_idx" ON "user_roles" ("user_id");--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_academic_year_id_academic_years_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_term_id_terms_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_learning_area_id_learning_areas_id_fkey" FOREIGN KEY ("learning_area_id") REFERENCES "learning_areas"("id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_profiles_id_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_teacher_id_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_stream_id_streams_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id");--> statement-breakpoint
ALTER TABLE "class_teacher_assignments" ADD CONSTRAINT "class_teacher_assignments_4uXUQkeZcUtP_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id");--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "learning_areas" ADD CONSTRAINT "learning_areas_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_parent_id_profiles_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_verified_by_profiles_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "streams" ADD CONSTRAINT "streams_grade_id_grades_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id");--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_stream_id_streams_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id");--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_academic_year_id_academic_years_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id");--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_assessment_id_assessments_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id");--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id");--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_entered_by_profiles_id_fkey" FOREIGN KEY ("entered_by") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_teacher_id_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_stream_id_streams_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id");--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_BYLCh24iwKQZ_fkey" FOREIGN KEY ("learning_area_id") REFERENCES "learning_areas"("id");--> statement-breakpoint
ALTER TABLE "subject_teacher_assignments" ADD CONSTRAINT "subject_teacher_assignments_QYCoJ5i3eg75_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id");--> statement-breakpoint
ALTER TABLE "terms" ADD CONSTRAINT "terms_academic_year_id_academic_years_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id");--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");