ALTER TABLE "students" ADD COLUMN "data_of_birth" date;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_unique" UNIQUE("student_id");