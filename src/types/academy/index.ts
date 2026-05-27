export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "video" | "article" | "document" | "quiz";
export type EnrollmentStatus = "active" | "completed" | "paused";

export type Course = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  status: CourseStatus;
  level: "beginner" | "intermediate" | "advanced";
  price: number;
  revenue: number;
  students: number;
  progressAverage: number;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  published: boolean;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  videoUrl: string | null;
  documentUrl: string | null;
  content: string;
  order: number;
  preview: boolean;
};

export type Quiz = {
  id: string;
  lessonId: string;
  title: string;
  questions: Array<{
    question: string;
    choices: string[];
    answer: string;
  }>;
  passingScore: number;
};

export type QuizResult = {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  passed: boolean;
  completedAt: string;
};

export type Enrollment = {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  accessType: "purchase" | "subscription" | "admin_grant";
  enrolledAt: string;
  completedAt: string | null;
};

export type Certificate = {
  id: string;
  courseId: string;
  studentId: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl: string | null;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  courseId: string | null;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
};

export type StudentProgress = {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  progress: number;
  notes: string;
  updatedAt: string;
};

export type AcademyNotification = {
  id: string;
  studentId: string | null;
  title: string;
  detail: string;
  severity: "info" | "success" | "warning";
  createdAt: string;
};

export type AcademyStudent = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "premium" | "business";
  badges: string[];
  learningMinutes: number;
  joinedAt: string;
};

export type AcademyData = {
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  quizzes: Quiz[];
  quizResults: QuizResult[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  communityPosts: CommunityPost[];
  communityComments: CommunityComment[];
  studentProgress: StudentProgress[];
  notifications: AcademyNotification[];
  students: AcademyStudent[];
};
