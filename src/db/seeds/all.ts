import { db } from "@/index";
import * as schema from "@/db/schemas";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import { users, USERS_SEED_FILE } from "./01-users";

// ---------------------------------------------------------------------------
// School structure
// ---------------------------------------------------------------------------

// Junior Secondary grades, each with the same four streams.
const GRADE_LEVELS = [7, 8, 9] as const;
const STREAM_NAMES: readonly string[] = ["Diamond", "Gold", "Ruby", "Silver"];

// There are 12 streams (3 grades x 4 streams) and each needs a class teacher.
// Keys must match 01-users.ts. The list is used round-robin, so with fewer
// teachers than streams some teachers get two classes. "teacher" comes first
// so they class-teach Grade 7 Diamond, where the two fixed students sit.
// To give every stream its own class teacher, add more teachers in 01-users.ts
// and list their keys here.
const CLASS_TEACHER_KEYS = [
  "teacher",
  "teacher_english",
  "teacher_kiswahili",
  "teacher_social",
  "teacher_pretech",
  "teacher_agriculture",
  "teacher_arts",
  "teacher_cre",
  "teacher_ire",
  "teacher_hre",
];

// ---------------------------------------------------------------------------
// Curriculum configuration
// ---------------------------------------------------------------------------

type Religion = "CRE" | "IRE" | "HRE";

// All learning areas. Religious Education is split into its three variants;
// each student takes exactly one of them (see `religionByStudent` below).
// `teacherKey` must match a `key` in 01-users.ts.
// `difficulty` nudges scores up/down so subjects look different on the dashboard.
const SUBJECTS = [
  {
    code: "ENG",
    name: "English",
    teacherKey: "teacher_english",
    difficulty: 0,
  },
  {
    code: "KIS",
    name: "Kiswahili",
    teacherKey: "teacher_kiswahili",
    difficulty: -0.02,
  },
  {
    code: "MAT",
    name: "Mathematics",
    teacherKey: "teacher",
    difficulty: -0.05,
  },
  {
    code: "CRE",
    name: "Christian Religious Education",
    teacherKey: "teacher_cre",
    difficulty: 0.04,
    religion: "CRE" as Religion,
  },
  {
    code: "IRE",
    name: "Islamic Religious Education",
    teacherKey: "teacher_ire",
    difficulty: 0.04,
    religion: "IRE" as Religion,
  },
  {
    code: "HRE",
    name: "Hindu Religious Education",
    teacherKey: "teacher_hre",
    difficulty: 0.04,
    religion: "HRE" as Religion,
  },
  {
    code: "SST",
    name: "Social Studies",
    teacherKey: "teacher_social",
    difficulty: 0.01,
  },
  {
    code: "ISC",
    name: "Integrated Science",
    teacherKey: "teacher",
    difficulty: -0.03,
  },
  {
    code: "PTS",
    name: "Pre-Technical Studies",
    teacherKey: "teacher_pretech",
    difficulty: 0.0,
  },
  {
    code: "AGR",
    name: "Agriculture",
    teacherKey: "teacher_agriculture",
    difficulty: 0.03,
  },
  {
    code: "CAS",
    name: "Creative Arts and Sports",
    teacherKey: "teacher_arts",
    difficulty: 0.06,
  },
] as const;

type Subject = (typeof SUBJECTS)[number];

// Must match the values of the `assessment_type` pgEnum.
const ASSESSMENT_TYPES = {
  classroom: "Classroom Assessment",
  sba: "School Based Assessment",
  national: "National Examinations",
} as const;

type AssessmentTemplate = {
  name: string;
  type: (typeof ASSESSMENT_TYPES)[keyof typeof ASSESSMENT_TYPES];
  maxScore: number;
  /** Where in the term the assessment happens (0 = first day, 1 = last day). */
  position: number;
  /** Score shift: assignments are easier, national assessments are harder. */
  shift: number;
  /** Terms in which this assessment is held. */
  terms: number[];
};

const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    name: "Assignment 1",
    type: ASSESSMENT_TYPES.classroom,
    maxScore: 20,
    position: 0.15,
    shift: 0.04,
    terms: [1, 2, 3],
  },
  {
    name: "CAT 1",
    type: ASSESSMENT_TYPES.classroom,
    maxScore: 30,
    position: 0.35,
    shift: 0,
    terms: [1, 2, 3],
  },
  {
    name: "Mid-Term Exam",
    type: ASSESSMENT_TYPES.sba,
    maxScore: 50,
    position: 0.55,
    shift: -0.01,
    terms: [1, 2, 3],
  },
  {
    name: "National Examination",
    type: ASSESSMENT_TYPES.national,
    maxScore: 100,
    position: 0.8,
    shift: -0.05,
    terms: [2],
  },
  {
    name: "End-Term Exam",
    type: ASSESSMENT_TYPES.sba,
    maxScore: 100,
    position: 0.92,
    shift: -0.02,
    terms: [1, 2, 3],
  },
];

// Term 3 ends on 30 Oct 2026, so its End-Term Exam hasn't been sat yet:
// it is seeded as a draft with no results.
function isPending(termNumber: number, templateName: string) {
  return termNumber === 3 && templateName === "End-Term Exam";
}

// CBC grading scale, highest band first.
const GRADING_SCALES = [
  { min: 80, max: 100, grade: "EE", remark: "Exceeding Expectation" },
  { min: 60, max: 79.99, grade: "ME", remark: "Meeting Expectation" },
  { min: 40, max: 59.99, grade: "AE", remark: "Approaching Expectation" },
  { min: 0, max: 39.99, grade: "BE", remark: "Below Expectation" },
] as const;

function gradeFor(percent: number) {
  return (
    GRADING_SCALES.find((band) => percent >= band.min) ??
    GRADING_SCALES[GRADING_SCALES.length - 1]
  );
}

const TEACHER_COMMENTS: Record<string, string[]> = {
  EE: [
    "Excellent work, keep it up",
    "Outstanding performance",
    "Exceptional grasp of the concepts",
    "Consistently excellent, a role model to peers",
  ],
  ME: [
    "Good understanding of concepts",
    "Solid performance, aim higher",
    "Meeting expectations, keep practising",
    "Good effort, with room to improve",
  ],
  AE: [
    "Fair attempt, more practice needed",
    "Approaching expectations, revise key topics",
    "Needs to put in more effort",
    "Improving, but needs extra support",
  ],
  BE: [
    "Needs urgent support in this area",
    "Below expectations, please see the teacher",
    "Requires remedial lessons",
    "Struggling with core concepts",
  ],
};

// ---------------------------------------------------------------------------
// Student generation helpers
// ---------------------------------------------------------------------------

// Total students, including the two fixed ones below. 120 gives roughly
// 10 students in each of the 12 streams.
const STUDENT_COUNT = 120;
const INSERT_CHUNK_SIZE = 100;
const RESULT_CHUNK_SIZE = 500;

// Faker has no Kenyan locale, so we pick from Kenyan name pools with faker's
// seeded randomness (keeps the output reproducible between runs).
const KENYAN_FIRST_NAMES = [
  "Ian",
  "Joy",
  "Brian",
  "Faith",
  "Kevin",
  "Mercy",
  "Dennis",
  "Grace",
  "Collins",
  "Esther",
  "Brenda",
  "Victor",
  "Lucy",
  "Samuel",
  "Purity",
  "Eric",
  "Cynthia",
  "Felix",
  "Winnie",
  "Peter",
  "Naomi",
  "Allan",
  "Mary",
  "Kelvin",
  "Sharon",
  "Martin",
  "Beatrice",
  "Emmanuel",
  "Hellen",
  "Duncan",
  "Caroline",
  "Austin",
  "Rose",
  "Vincent",
  "Irene",
  "Nelson",
  "Lilian",
  "Elvis",
  "Stacy",
  "Tony",
  "Diana",
  "Abdi",
  "Amina",
  "Hassan",
  "Fatuma",
  "Wafula",
  "Nafula",
  "Otieno",
  "Atieno",
  "Kiprop",
  "Chebet",
  "Kipchoge",
  "Wanjiru",
  "Mutua",
  "Mwikali",
  "Njoroge",
  "Wambui",
  "Kariuki",
];

const KENYAN_LAST_NAMES = [
  "Kamau",
  "Akinyi",
  "Otieno",
  "Wanjiku",
  "Mwangi",
  "Njeri",
  "Ochieng",
  "Wafula",
  "Kiplagat",
  "Chebet",
  "Mutua",
  "Kilonzo",
  "Omondi",
  "Adhiambo",
  "Kimani",
  "Waweru",
  "Maina",
  "Nyambura",
  "Karanja",
  "Muriuki",
  "Onyango",
  "Achieng",
  "Barasa",
  "Nekesa",
  "Kipkorir",
  "Jepkosgei",
  "Mbugua",
  "Gathoni",
  "Odhiambo",
  "Awino",
  "Juma",
  "Hussein",
  "Abdullahi",
  "Ndungu",
  "Wekesa",
  "Simiyu",
  "Rotich",
  "Koech",
  "Macharia",
  "Githinji",
  "Mwende",
  "Musyoka",
  "Nzioka",
  "Wairimu",
  "Ouma",
  "Anyango",
  "Mohamed",
  "Ali",
];

// Fixed students that other parts of the seeder rely on (parent link, results).
// Both are in Grade 7 and are placed in its first stream (Diamond).
const FIXED_STUDENTS = [
  {
    admissionNumber: "13521",
    fullName: "Ian Kamau",
    dateOfBirth: "2013-03-14",
    level: 7,
  },
  {
    admissionNumber: "14834",
    fullName: "Joy Akinyi",
    dateOfBirth: "2013-09-02",
    level: 7,
  },
];

// Fixed academic profiles so the demo students always look the same.
const FIXED_PERFORMANCE: Record<string, { ability: number; trend: number }> = {
  "13521": { ability: 0.84, trend: 0.015 }, // Ian: strong and improving
  "14834": { ability: 0.68, trend: 0.02 }, // Joy: solid, clearly improving
};

// In 2026, Grade 7 learners are typically 12-13 years old, Grade 8 are 13-14
// and Grade 9 are 14-15.
function randomDateOfBirth(level: number): string {
  return faker.date
    .between({ from: `${2019 - level}-09-01`, to: `${2021 - level}-08-31` })
    .toISOString()
    .slice(0, 10);
}

type SeedStudent = {
  schoolId: string;
  admissionNumber: string;
  fullName: string;
  dateOfBirth: string;
  status: "active";
  /** Grade level (7, 8 or 9). Not a DB column, stripped before inserting. */
  level: number;
};

function generateStudents(schoolId: string, count: number): SeedStudent[] {
  // Admission numbers are 5 digits in the 10000-19999 range (e.g. 13521).
  // A Set guarantees uniqueness across the whole batch.
  const usedAdmissionNumbers = new Set<string>(
    FIXED_STUDENTS.map((s) => s.admissionNumber),
  );
  const usedNames = new Set<string>(FIXED_STUDENTS.map((s) => s.fullName));

  const countByLevel = new Map<number, number>(
    GRADE_LEVELS.map((level) => [level, 0] as const),
  );

  const students: SeedStudent[] = [];
  const add = (student: SeedStudent) => {
    students.push(student);
    countByLevel.set(student.level, countByLevel.get(student.level)! + 1);
  };

  for (const s of FIXED_STUDENTS) {
    add({
      schoolId,
      admissionNumber: s.admissionNumber,
      fullName: s.fullName,
      dateOfBirth: s.dateOfBirth,
      status: "active",
      level: s.level,
    });
  }

  // Always put the next student in the grade with the fewest students so far,
  // which keeps the three grades evenly sized.
  const smallestGrade = () =>
    GRADE_LEVELS.reduce((a, b) =>
      countByLevel.get(b)! < countByLevel.get(a)! ? b : a,
    );

  while (students.length < count) {
    const admissionNumber = String(
      faker.number.int({ min: 10000, max: 19999 }),
    );
    if (usedAdmissionNumbers.has(admissionNumber)) continue;

    const fullName = `${faker.helpers.arrayElement(
      KENYAN_FIRST_NAMES,
    )} ${faker.helpers.arrayElement(KENYAN_LAST_NAMES)}`;
    // Avoid exact duplicate names so the data is easier to eyeball.
    if (usedNames.has(fullName)) continue;

    usedAdmissionNumbers.add(admissionNumber);
    usedNames.add(fullName);

    const level = smallestGrade();

    add({
      schoolId,
      admissionNumber,
      fullName,
      dateOfBirth: randomDateOfBirth(level),
      status: "active",
      level,
    });
  }

  // Sort by admission number so inserted order looks natural.
  return students.sort((a, b) =>
    a.admissionNumber.localeCompare(b.admissionNumber),
  );
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Normal distribution via Box-Muller, driven by faker's seeded RNG.
function gaussian(mean: number, sd: number) {
  const u = 1 - faker.number.float(); // (0, 1]
  const v = faker.number.float(); // [0, 1)
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// A moment inside a term, e.g. position 0.5 = the middle of the term.
function dateWithinTerm(
  term: { startDate: string; endDate: string },
  position: number,
) {
  const start = new Date(`${term.startDate}T08:00:00+03:00`).getTime();
  const end = new Date(`${term.endDate}T08:00:00+03:00`).getTime();
  return new Date(start + (end - start) * position);
}

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------

export default async function seed() {
  console.log("🌱 Starting database seed...");

  // Make the generated data reproducible between runs.
  faker.seed(2026);

  // 1. Roles
  console.log("Seeding Roles...");
  const [rolePrincipal, roleClassTeacher, roleTeacher, roleParent] = await db
    .insert(schema.roles)
    .values([
      { name: "principal", description: "School Administrator" },
      { name: "class_teacher", description: "Class/Form Teacher" },
      { name: "teacher", description: "Subject Teacher" },
      { name: "parent", description: "Student Guardian/Parent" },
    ])
    .returning();

  // 2. School
  console.log("Seeding School...");
  const [school] = await db
    .insert(schema.schools)
    .values({
      name: "Mwangaza Junior Secondary",
      code: "MJS-001",
    })
    .returning();

  // 3. Academic Year (e.g., 2026 Kenyan School Calendar)
  console.log("Seeding Academic Year...");
  const [academicYear] = await db
    .insert(schema.academicYears)
    .values({
      schoolId: school.id,
      name: "2026",
      startDate: "2026-01-05",
      endDate: "2026-10-30",
    })
    .returning();

  // 4. Terms
  console.log("Seeding Terms...");
  const terms = await db
    .insert(schema.terms)
    .values([
      {
        academicYearId: academicYear.id,
        termNumber: 1,
        startDate: "2026-01-05",
        endDate: "2026-04-10",
      },
      {
        academicYearId: academicYear.id,
        termNumber: 2,
        startDate: "2026-05-04",
        endDate: "2026-08-07",
      },
      {
        academicYearId: academicYear.id,
        termNumber: 3,
        startDate: "2026-08-31",
        endDate: "2026-10-30",
      },
    ])
    .returning();

  // 5. Grades (Junior Secondary: 7, 8, 9)
  console.log("Seeding Grades...");
  const grades = await db
    .insert(schema.grades)
    .values(
      GRADE_LEVELS.map((level) => ({
        schoolId: school.id,
        name: `Grade ${level}`,
        level,
      })),
    )
    .returning();

  // 6. Streams (Diamond, Gold, Ruby and Silver in every grade)
  console.log("Seeding Streams...");
  const streams = await db
    .insert(schema.streams)
    .values(
      grades.flatMap((grade) =>
        STREAM_NAMES.map((name) => ({ gradeId: grade.id, name })),
      ),
    )
    .returning();

  // Streams grouped by grade level, always in STREAM_NAMES order.
  const streamsByLevel = new Map<number, typeof streams>();
  for (const level of GRADE_LEVELS) {
    const grade = grades.find((g) => g.level === level)!;
    streamsByLevel.set(
      level,
      streams
        .filter((s) => s.gradeId === grade.id)
        .sort(
          (a, b) => STREAM_NAMES.indexOf(a.name) - STREAM_NAMES.indexOf(b.name),
        ),
    );
  }
  // All streams ordered Grade 7 (Diamond..Silver), then Grade 8, then Grade 9.
  const orderedStreams = GRADE_LEVELS.flatMap(
    (level) => streamsByLevel.get(level)!,
  );

  // 7. Learning Areas (CBC Curriculum)
  console.log("Seeding Learning Areas...");
  const learningAreas = await db
    .insert(schema.learningAreas)
    .values(
      SUBJECTS.map((subject) => ({
        schoolId: school.id,
        name: subject.name,
        code: subject.code,
        isActive: true,
      })),
    )
    .returning();

  const learningAreaByCode = new Map(learningAreas.map((la) => [la.code, la]));
  const subjectByLearningAreaId = new Map<string, Subject>(
    SUBJECTS.map((subject) => [
      learningAreaByCode.get(subject.code)!.id,
      subject,
    ]),
  );

  // 8. Grading Scales (CBC Standard)
  console.log("Seeding Grading Scales...");
  await db.insert(schema.gradingScales).values(
    GRADING_SCALES.map((band) => ({
      schoolId: school.id,
      name: "CBC Grading",
      minScore: band.min.toFixed(2),
      maxScore: band.max.toFixed(2),
      grade: band.grade,
      remark: band.remark,
    })),
  );

  // 9. Profiles & User Roles
  console.log("Seeding Profiles...");

  // Read the IDs generated by 01-users.ts.
  const idsPath = path.resolve(USERS_SEED_FILE);

  if (!fs.existsSync(idsPath)) {
    throw new Error(
      `User IDs file not found at ${idsPath}. Run the user seeder first.`,
    );
  }

  const userIds: Record<string, string> = JSON.parse(
    fs.readFileSync(idsPath, "utf-8"),
  );

  // Ensure every configured user has a corresponding Supabase Auth ID.
  for (const user of users) {
    if (!userIds[user.key]) {
      throw new Error(
        `Missing Supabase Auth ID for user "${user.key}". Run the user seeder first.`,
      );
    }
  }

  const profiles = await db
    .insert(schema.profiles)
    .values(
      users.map((user) => ({
        id: userIds[user.key],
        fullName: user.fullName,
        phone: user.phone,
      })),
    )
    .returning();

  // Look up a seeded profile by its user key; fail early if it's missing.
  const byKey = (key: string) => {
    const profile = profiles.find((p) => p.id === userIds[key]);
    if (!profile) throw new Error(`Missing profile for "${key}"`);
    return profile;
  };

  const principal = byKey("principal");
  const parents = users
    .filter((u) => u.role === "parent")
    .map((u) => byKey(u.key));

  if (parents.length < 3) {
    throw new Error("At least 3 parents are required by the seeder.");
  }

  // Every stream has exactly one class teacher. The teacher list is reused
  // round-robin, so a teacher may look after more than one stream.
  const classTeacherRows = orderedStreams.map((stream, i) => ({
    teacherId: byKey(CLASS_TEACHER_KEYS[i % CLASS_TEACHER_KEYS.length]!).id,
    streamId: stream.id,
    academicYearId: academicYear.id,
  }));
  const classTeacherIds = [
    ...new Set(classTeacherRows.map((row) => row.teacherId)),
  ];

  // Role assignments, one per user, based on the role declared in 01-users.ts.
  const roleIdByUserRole = {
    principal: rolePrincipal.id,
    teacher: roleTeacher.id,
    parent: roleParent.id,
  } as const;

  await db.insert(schema.userRoles).values([
    ...users.map((user) => ({
      userId: userIds[user.key],
      roleId: roleIdByUserRole[user.role],
      schoolId: school.id,
    })),
    // Class teachers also get the class_teacher role (once each).
    ...classTeacherIds.map((userId) => ({
      userId,
      roleId: roleClassTeacher.id,
      schoolId: school.id,
    })),
  ]);

  // 10. Teacher Assignments
  console.log("Seeding Teacher Assignments...");

  await db.insert(schema.classTeacherAssignments).values(classTeacherRows);

  // Every learning area is taught in every stream by its subject teacher.
  const subjectTeacherRows = SUBJECTS.flatMap((subject) =>
    streams.map((stream) => ({
      teacherId: byKey(subject.teacherKey).id,
      streamId: stream.id,
      learningAreaId: learningAreaByCode.get(subject.code)!.id,
      academicYearId: academicYear.id,
    })),
  );
  await db.insert(schema.subjectTeacherAssignments).values(subjectTeacherRows);

  // 11. Students
  console.log(`Seeding ${STUDENT_COUNT} Students...`);
  const studentSeeds = generateStudents(school.id, STUDENT_COUNT);

  // Grade level lives only in the seeder, so remember it by admission number
  // (unique per school) and strip it before inserting.
  const levelByAdmission = new Map(
    studentSeeds.map((s) => [s.admissionNumber, s.level]),
  );
  const studentValues = studentSeeds.map(({ level: _level, ...row }) => row);

  const students: (typeof schema.students.$inferSelect)[] = [];
  for (const batch of chunk(studentValues, INSERT_CHUNK_SIZE)) {
    const inserted = await db.insert(schema.students).values(batch).returning();
    students.push(...inserted);
  }

  // The first two fixed students are used below for the parent links.
  const student1 = students.find((s) => s.admissionNumber === "13521");
  const student2 = students.find((s) => s.admissionNumber === "14834");

  if (!student1 || !student2) {
    throw new Error("Failed to retrieve the fixed seed students.");
  }

  // 12. Student Enrollments
  console.log("Seeding Enrollments...");

  // Within each grade, students are dealt into its four streams in turn so
  // the classes end up the same size. The two fixed students go to Grade 7
  // Diamond.
  const nextStreamIndex = new Map<number, number>(
    GRADE_LEVELS.map((level) => [level, 0] as const),
  );

  const enrollmentValues = students.map((student) => {
    const level = levelByAdmission.get(student.admissionNumber)!;
    const gradeStreams = streamsByLevel.get(level)!;
    const isFixed = student.id === student1.id || student.id === student2.id;

    let stream: (typeof streams)[number];
    if (isFixed) {
      stream = gradeStreams[0]!;
    } else {
      const index = nextStreamIndex.get(level)!;
      stream = gradeStreams[index % gradeStreams.length]!;
      nextStreamIndex.set(level, index + 1);
    }

    return {
      studentId: student.id,
      streamId: stream.id,
      academicYearId: academicYear.id,
      startDate: "2026-01-05",
    };
  });

  for (const batch of chunk(enrollmentValues, INSERT_CHUNK_SIZE)) {
    await db.insert(schema.studentEnrollments).values(batch);
  }

  // 13. Parent-Student Links
  console.log("Seeding Parent-Student records...");

  // Fixed students keep fixed parents; everyone else is spread across the
  // remaining parents so no parent is left without a child.
  const parentIdByStudent = new Map<string, string>([
    [student1.id, parents[0].id],
    [student2.id, parents[1].id],
  ]);

  students
    .filter((s) => !parentIdByStudent.has(s.id))
    .forEach((s, i) => {
      parentIdByStudent.set(s.id, parents[2 + (i % (parents.length - 2))].id);
    });

  if (parentIdByStudent.size !== students.length) {
    throw new Error("Some students were left without a parent.");
  }

  const parentLinkValues = students.map((s) => ({
    parentId: parentIdByStudent.get(s.id)!,
    studentId: s.id,
    verificationStatus: "verified" as const,
    verifiedAt: new Date(),
    verifiedBy: principal.id,
  }));

  for (const batch of chunk(parentLinkValues, INSERT_CHUNK_SIZE)) {
    await db.insert(schema.parentStudents).values(batch);
  }

  // 14. Religious Education choice
  // Each student takes exactly one of CRE / IRE / HRE (roughly 78% / 16% / 6%).
  // There is no student-subject table, so this lives only in the seeder and
  // decides who gets results for which RE variant.
  const religionByStudent = new Map<string, Religion>([
    [student1.id, "CRE"],
    [student2.id, "CRE"],
  ]);

  const others = faker.helpers.shuffle(
    students.filter((s) => !religionByStudent.has(s.id)),
  );
  const ireCount = Math.max(1, Math.round(others.length * 0.16));
  const hreCount = Math.max(1, Math.round(others.length * 0.06));

  others.forEach((student, i) => {
    religionByStudent.set(
      student.id,
      i < ireCount ? "IRE" : i < ireCount + hreCount ? "HRE" : "CRE",
    );
  });

  // 15. Assessments (3 terms x 11 learning areas)
  // Assessments belong to a learning area, not to a grade or stream, so all
  // three grades share the same assessments and each student gets a result.
  console.log("Seeding Assessments...");

  type AssessmentMeta = {
    subject: Subject;
    template: AssessmentTemplate;
    termNumber: number;
    date: Date;
    published: boolean;
  };

  const assessmentValues: (typeof schema.assessments.$inferInsert)[] = [];
  const metaByName = new Map<string, AssessmentMeta>();

  for (const term of terms) {
    for (const subject of SUBJECTS) {
      for (const template of ASSESSMENT_TEMPLATES) {
        if (!template.terms.includes(term.termNumber)) continue;

        const name = `Term ${term.termNumber} ${template.name} - ${subject.name}`;
        const published = !isPending(term.termNumber, template.name);
        const date = dateWithinTerm(term, template.position);

        assessmentValues.push({
          schoolId: school.id,
          academicYearId: academicYear.id,
          termId: term.id,
          learningAreaId: learningAreaByCode.get(subject.code)!.id,
          name,
          assessmentType: template.type,
          maxScore: template.maxScore.toFixed(2),
          status: published ? ("published" as const) : ("draft" as const),
          createdBy: byKey(subject.teacherKey).id,
          createdAt: date,
        });

        metaByName.set(name, {
          subject,
          template,
          termNumber: term.termNumber,
          date,
          published,
        });
      }
    }
  }

  const assessments: (typeof schema.assessments.$inferSelect)[] = [];
  for (const batch of chunk(assessmentValues, INSERT_CHUNK_SIZE)) {
    const inserted = await db
      .insert(schema.assessments)
      .values(batch)
      .returning();
    assessments.push(...inserted);
  }

  // 16. Student Results
  console.log("Seeding Results...");

  // Every student gets a stable ability, a term-on-term trend (some improve,
  // some slip) and a small aptitude offset per subject.
  const performanceByStudent = new Map<
    string,
    { ability: number; trend: number; aptitude: Map<string, number> }
  >();

  for (const student of students) {
    const fixed = FIXED_PERFORMANCE[student.admissionNumber];
    performanceByStudent.set(student.id, {
      ability: fixed?.ability ?? clamp(gaussian(0.62, 0.14), 0.25, 0.92),
      trend: fixed?.trend ?? gaussian(0.01, 0.025),
      aptitude: new Map(
        SUBJECTS.map((subject) => [subject.code, gaussian(0, 0.07)]),
      ),
    });
  }

  const resultValues: (typeof schema.studentResults.$inferInsert)[] = [];

  for (const assessment of assessments) {
    const meta = metaByName.get(assessment.name);
    if (!meta || !meta.published) continue;

    const { subject, template, termNumber, date } = meta;
    const maxScore = Number(assessment.maxScore);
    const enteredBy = byKey(subject.teacherKey).id;
    // Marks are usually entered a few days after the assessment.
    const enteredAt = new Date(date.getTime() + 3 * DAY_MS);

    for (const student of students) {
      // RE variants only apply to the students who take that variant.
      if (
        "religion" in subject &&
        religionByStudent.get(student.id) !== subject.religion
      ) {
        continue;
      }

      const profile = performanceByStudent.get(student.id)!;
      const ratio = clamp(
        profile.ability +
          profile.aptitude.get(subject.code)! +
          subject.difficulty +
          profile.trend * (termNumber - 1) +
          template.shift +
          gaussian(0, 0.05),
        0.08,
        0.98,
      );

      // Round to the nearest half mark.
      const score = Math.round(ratio * maxScore * 2) / 2;
      const band = gradeFor((score / maxScore) * 100);

      resultValues.push({
        assessmentId: assessment.id,
        studentId: student.id,
        score: score.toFixed(2),
        grade: band.grade,
        remark: faker.helpers.arrayElement(TEACHER_COMMENTS[band.grade]),
        enteredBy,
        updatedAt: enteredAt,
      });
    }
  }

  for (const batch of chunk(resultValues, RESULT_CHUNK_SIZE)) {
    await db.insert(schema.studentResults).values(batch);
  }

  // 17. Sanity checks
  const streamsWithClassTeacher = new Set(
    classTeacherRows.map((row) => row.streamId),
  );
  if (!streams.every((stream) => streamsWithClassTeacher.has(stream.id))) {
    throw new Error("A stream is missing a class teacher.");
  }
  if (subjectTeacherRows.length !== SUBJECTS.length * streams.length) {
    throw new Error("A learning area is missing a teacher in some stream.");
  }
  const enrolledStreamIds = new Set(enrollmentValues.map((e) => e.streamId));
  if (!streams.every((stream) => enrolledStreamIds.has(stream.id))) {
    throw new Error("A stream has no enrolled students.");
  }

  console.log(
    `📊 ${grades.length} grades, ${streams.length} streams, ` +
      `${students.length} students, ${parents.length} parents, ` +
      `${learningAreas.length} learning areas, ${assessments.length} assessments, ` +
      `${resultValues.length} results`,
  );
  console.log("✅ Seeding completed successfully!");
}
