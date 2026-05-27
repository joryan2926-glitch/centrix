"use client";

import dynamic from "next/dynamic";
import { Award, Bell, BookOpen, CirclePlay, GraduationCap, MessageSquare, Plus, Save, Sparkles, UsersRound, WalletCards } from "lucide-react";
import { formatAcademyCurrency, formatAcademyDate, formatAcademyDuration } from "@/lib/academy/format";
import { courseStatusLabels, courseTone, createAcademyNotification, createCourse, getAcademyDashboard } from "@/services/academy/calculations";
import { useAcademyData } from "@/hooks/academy/useAcademyData";
import { AcademyKpiCard } from "@/ui/academy/AcademyKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const AcademyCharts = dynamic(() => import("@/components/academy/AcademyCharts").then((module) => module.AcademyCharts), {
  loading: () => <Skeleton className="h-80" />,
  ssr: false
});

export function AcademyWorkspace({ initialCommunity = false }: { initialCommunity?: boolean }) {
  const { data, loading, mode, toast, mutate, sync } = useAcademyData();
  const dashboard = getAcademyDashboard(data);

  function addCourse() {
    const course = createCourse("Nouvelle formation CENTRIX");
    mutate(
      (current) => ({ ...current, courses: [course, ...current.courses], notifications: [createAcademyNotification("Formation creee", course.title, "success"), ...current.notifications] }),
      { title: "Formation creee", detail: "Le brouillon est pret dans l'editeur." }
    );
  }

  function toggleCourse(id: string) {
    mutate((current) => ({
      ...current,
      courses: current.courses.map((course) => course.id === id ? { ...course, status: course.status === "published" ? "draft" : "published", publishedAt: course.status === "published" ? null : new Date().toISOString(), updatedAt: new Date().toISOString() } : course)
    }));
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl space-y-6 animate-fade-in"><Skeleton className="h-36" /><Skeleton className="h-[560px]" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="violet">CENTRIX Academy</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Plateforme e-learning SaaS</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Formations premium, lecteur cours, quiz, certificats, communaute, abonnements, profils apprenants et analytics Academy.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button onClick={addCourse}><Plus size={17} /> Formation</Button><Button onClick={sync} variant="primary"><Save size={17} /> Sync {mode}</Button></div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AcademyKpiCard delta="publiees" icon={<BookOpen size={19} />} label="Formations actives" value={String(dashboard.activeCourses)} />
        <AcademyKpiCard delta="apprenants" icon={<UsersRound size={19} />} label="Etudiants inscrits" tone="emerald" value={String(dashboard.students)} />
        <AcademyKpiCard delta="moyenne" icon={<CirclePlay size={19} />} label="Progression" value={`${dashboard.averageProgress}%`} />
        <AcademyKpiCard delta="revenus" icon={<WalletCards size={19} />} label="Revenus formations" tone="emerald" value={formatAcademyCurrency(dashboard.revenue)} />
        <AcademyKpiCard delta="certifs" icon={<Award size={19} />} label="Certifications" tone="violet" value={String(dashboard.certificates)} />
        <AcademyKpiCard delta="community" icon={<MessageSquare size={19} />} label="Activite communaute" value={String(dashboard.communityActivity)} />
      </section>

      {!initialCommunity ? <AcademyCharts data={data} /> : null}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">{initialCommunity ? "Communaute Academy" : "Gestion formations"}</h2><Badge tone="cyan">Realtime</Badge></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(initialCommunity ? data.communityPosts : data.courses).map((item) => {
              if ("likes" in item) {
                const author = data.students.find((student) => student.id === item.authorId);
                return <Card key={item.id} interactive className="p-4"><MessageSquare size={18} className="text-cyan-100" /><p className="mt-3 font-semibold text-white">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-400">{item.content}</p><p className="mt-3 text-xs text-slate-500">{author?.name} - {item.likes} likes</p></Card>;
              }
              return (
                <button key={item.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:-translate-y-1 hover:bg-white/[0.08]" onClick={() => toggleCourse(item.id)}>
                  <div className="flex items-center justify-between gap-3"><p className="font-semibold text-white">{item.title}</p><Badge tone={courseTone(item.status)}>{courseStatusLabels[item.status]}</Badge></div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2"><Badge tone="cyan">{item.category}</Badge><Badge tone="violet">{item.level}</Badge><Badge tone="emerald">{formatAcademyCurrency(item.price)}</Badge></div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2"><GraduationCap size={18} className="text-cyan-100" /><h2 className="text-lg font-semibold text-white">Lecteur formation</h2></div>
            <div className="mt-5 rounded-[8px] border border-white/10 bg-black/30 p-5">
              <CirclePlay className="mx-auto text-cyan-100" size={54} />
              <p className="mt-4 text-center font-semibold text-white">Video premium</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[64%] rounded-full bg-gradient-to-r from-electric to-violet" /></div>
              <p className="mt-3 text-center text-xs text-slate-500">Reprise automatique, notes, favoris, telechargements et plein ecran prepares.</p>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Quiz & certificats</h2>
            <div className="mt-4 space-y-3">{data.quizResults.map((result) => <div key={result.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center justify-between"><span className="text-sm text-white">Score {result.score}%</span><Badge tone={result.passed ? "emerald" : "rose"}>{result.passed ? "Valide" : "A reprendre"}</Badge></div></div>)}</div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Profils apprenants</h2>
            <div className="mt-4 space-y-3">{data.students.map((student) => <div key={student.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center justify-between"><span className="text-sm text-white">{student.name}</span><Badge tone="cyan">{student.plan}</Badge></div><p className="mt-1 text-xs text-slate-500">{formatAcademyDuration(student.learningMinutes)} - {student.badges.join(", ")}</p></div>)}</div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.notifications.map((notification) => <Card key={notification.id} interactive className="p-4"><Bell size={18} className="text-cyan-100" /><p className="mt-3 font-semibold text-white">{notification.title}</p><p className="mt-2 text-sm text-slate-400">{notification.detail}</p><p className="mt-3 text-xs text-slate-500">{formatAcademyDate(notification.createdAt)}</p></Card>)}
      </section>

      {!data.courses.length ? <EmptyState icon={<Sparkles size={20} />} title="Aucune formation" detail="Creez votre premiere formation CENTRIX Academy." /> : null}
    </div>
  );
}
