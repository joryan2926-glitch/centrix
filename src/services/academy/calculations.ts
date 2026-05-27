import type { AcademyData, AcademyNotification, Course, CourseStatus } from "@/types/academy";

export const courseStatusLabels: Record<CourseStatus, string> = {
  draft: "Brouillon",
  published: "Publie",
  archived: "Archive"
};

export function getAcademyDashboard(data: AcademyData) {
  const activeCourses = data.courses.filter((course) => course.status === "published").length;
  const students = data.students.length;
  const averageProgress = data.courses.length ? Math.round(data.courses.reduce((sum, course) => sum + course.progressAverage, 0) / data.courses.length) : 0;
  const revenue = data.courses.reduce((sum, course) => sum + course.revenue, 0);
  return {
    activeCourses,
    students,
    averageProgress,
    revenue,
    certificates: data.certificates.length,
    communityActivity: data.communityPosts.length + data.communityComments.length
  };
}

export function createCourse(title: string): Course {
  const now = new Date().toISOString();
  return {
    id: `course-${crypto.randomUUID()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    category: "Business",
    description: "Nouvelle formation CENTRIX Academy prete a structurer.",
    status: "draft",
    level: "beginner",
    price: 299,
    revenue: 0,
    students: 0,
    progressAverage: 0,
    thumbnailUrl: null,
    publishedAt: null,
    updatedAt: now
  };
}

export function createAcademyNotification(title: string, detail: string, severity: AcademyNotification["severity"] = "info"): AcademyNotification {
  return {
    id: `acad-notif-${crypto.randomUUID()}`,
    studentId: null,
    title,
    detail,
    severity,
    createdAt: new Date().toISOString()
  };
}

export function courseTone(status: CourseStatus) {
  if (status === "published") return "emerald" as const;
  if (status === "draft") return "violet" as const;
  return "rose" as const;
}
