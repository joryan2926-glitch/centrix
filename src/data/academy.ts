import type { AcademyData } from "@/types/academy";

export const academyFallbackData: AcademyData = {
  courses: [
    {
      id: "course-saas-ops",
      title: "SaaS Operating System",
      slug: "saas-operating-system",
      category: "Operations",
      description: "Construire les fondations operationnelles d'un SaaS moderne avec CRM, billing, support et analytics.",
      status: "published",
      level: "advanced",
      price: 499,
      revenue: 28430,
      students: 184,
      progressAverage: 68,
      thumbnailUrl: null,
      publishedAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-05-26T08:00:00.000Z"
    },
    {
      id: "course-ai-business",
      title: "IA Business & Automatisations",
      slug: "ia-business-automatisations",
      category: "IA",
      description: "Creer des workflows IA rentables, des prompts business et des automatisations no-code.",
      status: "published",
      level: "intermediate",
      price: 349,
      revenue: 19620,
      students: 142,
      progressAverage: 74,
      thumbnailUrl: null,
      publishedAt: "2026-04-10T08:00:00.000Z",
      updatedAt: "2026-05-25T08:00:00.000Z"
    },
    {
      id: "course-fintech-billing",
      title: "Fintech Billing Masterclass",
      slug: "fintech-billing-masterclass",
      category: "Finance",
      description: "Maîtriser MRR, Stripe Billing, TVA, relances et analytics financiers SaaS.",
      status: "draft",
      level: "advanced",
      price: 599,
      revenue: 0,
      students: 38,
      progressAverage: 22,
      thumbnailUrl: null,
      publishedAt: null,
      updatedAt: "2026-05-24T08:00:00.000Z"
    }
  ],
  modules: [
    { id: "mod-ops-1", courseId: "course-saas-ops", title: "Fondations SaaS", order: 1, published: true },
    { id: "mod-ops-2", courseId: "course-saas-ops", title: "Operations commerciales", order: 2, published: true },
    { id: "mod-ai-1", courseId: "course-ai-business", title: "Copilote IA", order: 1, published: true },
    { id: "mod-billing-1", courseId: "course-fintech-billing", title: "Monetisation", order: 1, published: false }
  ],
  lessons: [
    { id: "lesson-ops-1", moduleId: "mod-ops-1", title: "Architecture d'un SaaS scalable", type: "video", durationMinutes: 24, videoUrl: null, documentUrl: null, content: "Video premium sur la structure operating system.", order: 1, preview: true },
    { id: "lesson-ops-2", moduleId: "mod-ops-1", title: "KPIs et dashboards", type: "article", durationMinutes: 18, videoUrl: null, documentUrl: null, content: "MRR, activation, support, finance et retention.", order: 2, preview: false },
    { id: "lesson-ai-1", moduleId: "mod-ai-1", title: "Prompts systeme business", type: "video", durationMinutes: 31, videoUrl: null, documentUrl: null, content: "Creer des prompts fiables pour operations SaaS.", order: 1, preview: true },
    { id: "lesson-ai-quiz", moduleId: "mod-ai-1", title: "Quiz automatisations IA", type: "quiz", durationMinutes: 10, videoUrl: null, documentUrl: null, content: "Validation des acquis.", order: 2, preview: false }
  ],
  quizzes: [
    {
      id: "quiz-ai-1",
      lessonId: "lesson-ai-quiz",
      title: "Automatisations IA",
      passingScore: 80,
      questions: [
        { question: "Quel est le premier objectif d'un workflow IA ?", choices: ["Automatiser sans controle", "Reduire une friction mesurable", "Remplacer toute l'equipe"], answer: "Reduire une friction mesurable" },
        { question: "Pourquoi tracer les executions ?", choices: ["Audit et amelioration", "Decoration", "Masquer les erreurs"], answer: "Audit et amelioration" }
      ]
    }
  ],
  quizResults: [
    { id: "qr-1", quizId: "quiz-ai-1", studentId: "stu-lea", score: 92, passed: true, completedAt: "2026-05-24T10:00:00.000Z" }
  ],
  enrollments: [
    { id: "enroll-1", courseId: "course-saas-ops", studentId: "stu-lea", status: "active", accessType: "subscription", enrolledAt: "2026-05-01T08:00:00.000Z", completedAt: null },
    { id: "enroll-2", courseId: "course-ai-business", studentId: "stu-yanis", status: "completed", accessType: "purchase", enrolledAt: "2026-04-12T08:00:00.000Z", completedAt: "2026-05-20T08:00:00.000Z" },
    { id: "enroll-3", courseId: "course-saas-ops", studentId: "stu-nora", status: "active", accessType: "purchase", enrolledAt: "2026-05-18T08:00:00.000Z", completedAt: null }
  ],
  certificates: [
    { id: "cert-1", courseId: "course-ai-business", studentId: "stu-yanis", certificateNumber: "CXA-2026-001", issuedAt: "2026-05-20T08:00:00.000Z", pdfUrl: null }
  ],
  communityPosts: [
    { id: "post-1", authorId: "stu-lea", courseId: "course-saas-ops", title: "Votre stack dashboard ?", content: "Quels KPIs suivez-vous chaque lundi matin ?", likes: 28, createdAt: "2026-05-26T08:00:00.000Z" },
    { id: "post-2", authorId: "stu-yanis", courseId: "course-ai-business", title: "Prompt relance client", content: "Je partage mon template pour relancer les deals froids.", likes: 42, createdAt: "2026-05-25T14:00:00.000Z" }
  ],
  communityComments: [
    { id: "comment-1", postId: "post-1", authorId: "stu-nora", content: "MRR, activation, tickets urgents et cashflow.", likes: 9, createdAt: "2026-05-26T09:00:00.000Z" }
  ],
  studentProgress: [
    { id: "progress-1", studentId: "stu-lea", courseId: "course-saas-ops", lessonId: "lesson-ops-1", completed: true, progress: 100, notes: "Revoir la partie architecture modulaire.", updatedAt: "2026-05-24T09:00:00.000Z" },
    { id: "progress-2", studentId: "stu-lea", courseId: "course-saas-ops", lessonId: "lesson-ops-2", completed: false, progress: 45, notes: "Ajouter mes KPIs support.", updatedAt: "2026-05-26T09:00:00.000Z" }
  ],
  notifications: [
    { id: "acad-notif-1", studentId: "stu-lea", title: "Nouvelle lecon disponible", detail: "KPIs et dashboards est disponible dans SaaS Operating System.", severity: "info", createdAt: "2026-05-26T08:30:00.000Z" },
    { id: "acad-notif-2", studentId: "stu-yanis", title: "Certificat delivre", detail: "Votre certificat CENTRIX Academy CXA-2026-001 est pret.", severity: "success", createdAt: "2026-05-20T08:00:00.000Z" }
  ],
  students: [
    { id: "stu-lea", name: "Lea Martin", email: "lea@centrix.local", avatarUrl: null, plan: "premium", badges: ["Builder", "Ops"], learningMinutes: 420, joinedAt: "2026-05-01T08:00:00.000Z" },
    { id: "stu-yanis", name: "Yanis Perrin", email: "yanis@centrix.local", avatarUrl: null, plan: "business", badges: ["Certified", "AI"], learningMinutes: 680, joinedAt: "2026-04-12T08:00:00.000Z" },
    { id: "stu-nora", name: "Nora Chen", email: "nora@centrix.local", avatarUrl: null, plan: "free", badges: ["Starter"], learningMinutes: 95, joinedAt: "2026-05-18T08:00:00.000Z" }
  ]
};
