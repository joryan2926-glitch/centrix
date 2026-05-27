create table if not exists public.courses (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null,
  description text not null,
  status text not null check (status in ('draft', 'published', 'archived')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  price numeric not null default 0,
  revenue numeric not null default 0,
  students numeric not null default 0,
  "progressAverage" numeric not null default 0,
  "thumbnailUrl" text,
  "publishedAt" timestamptz,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.course_modules (
  id text primary key,
  "courseId" text not null references public.courses(id) on delete cascade,
  title text not null,
  "order" numeric not null default 0,
  published boolean not null default false
);

create table if not exists public.lessons (
  id text primary key,
  "moduleId" text not null references public.course_modules(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video', 'article', 'document', 'quiz')),
  "durationMinutes" numeric not null default 0,
  "videoUrl" text,
  "documentUrl" text,
  content text not null,
  "order" numeric not null default 0,
  preview boolean not null default false
);

create table if not exists public.quizzes (
  id text primary key,
  "lessonId" text not null references public.lessons(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  "passingScore" numeric not null default 80
);

create table if not exists public.quiz_results (
  id text primary key,
  "quizId" text not null references public.quizzes(id) on delete cascade,
  "studentId" text not null,
  score numeric not null default 0,
  passed boolean not null default false,
  "completedAt" timestamptz not null default now()
);

create table if not exists public.enrollments (
  id text primary key,
  "courseId" text not null references public.courses(id) on delete cascade,
  "studentId" text not null,
  status text not null check (status in ('active', 'completed', 'paused')),
  "accessType" text not null check ("accessType" in ('purchase', 'subscription', 'admin_grant')),
  "enrolledAt" timestamptz not null default now(),
  "completedAt" timestamptz
);

create table if not exists public.certificates (
  id text primary key,
  "courseId" text not null references public.courses(id) on delete cascade,
  "studentId" text not null,
  "certificateNumber" text not null,
  "issuedAt" timestamptz not null default now(),
  "pdfUrl" text
);

create table if not exists public.community_posts (
  id text primary key,
  "authorId" text not null,
  "courseId" text references public.courses(id) on delete set null,
  title text not null,
  content text not null,
  likes numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.community_comments (
  id text primary key,
  "postId" text not null references public.community_posts(id) on delete cascade,
  "authorId" text not null,
  content text not null,
  likes numeric not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.student_progress (
  id text primary key,
  "studentId" text not null,
  "courseId" text not null references public.courses(id) on delete cascade,
  "lessonId" text not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  progress numeric not null default 0,
  notes text not null default '',
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.academy_notifications (
  id text primary key,
  "studentId" text,
  title text not null,
  detail text not null,
  severity text not null check (severity in ('info', 'success', 'warning')),
  "createdAt" timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.student_progress enable row level security;
alter table public.academy_notifications enable row level security;

create policy "academy courses read" on public.courses for select to anon, authenticated using (true);
create policy "academy courses write" on public.courses for all to anon, authenticated using (true) with check (true);
create policy "academy modules read" on public.course_modules for select to anon, authenticated using (true);
create policy "academy modules write" on public.course_modules for all to anon, authenticated using (true) with check (true);
create policy "academy lessons read" on public.lessons for select to anon, authenticated using (true);
create policy "academy lessons write" on public.lessons for all to anon, authenticated using (true) with check (true);
create policy "academy quizzes read" on public.quizzes for select to anon, authenticated using (true);
create policy "academy quizzes write" on public.quizzes for all to anon, authenticated using (true) with check (true);
create policy "academy quiz results read" on public.quiz_results for select to anon, authenticated using (true);
create policy "academy quiz results write" on public.quiz_results for all to anon, authenticated using (true) with check (true);
create policy "academy enrollments read" on public.enrollments for select to anon, authenticated using (true);
create policy "academy enrollments write" on public.enrollments for all to anon, authenticated using (true) with check (true);
create policy "academy certificates read" on public.certificates for select to anon, authenticated using (true);
create policy "academy certificates write" on public.certificates for all to anon, authenticated using (true) with check (true);
create policy "academy posts read" on public.community_posts for select to anon, authenticated using (true);
create policy "academy posts write" on public.community_posts for all to anon, authenticated using (true) with check (true);
create policy "academy comments read" on public.community_comments for select to anon, authenticated using (true);
create policy "academy comments write" on public.community_comments for all to anon, authenticated using (true) with check (true);
create policy "academy progress read" on public.student_progress for select to anon, authenticated using (true);
create policy "academy progress write" on public.student_progress for all to anon, authenticated using (true) with check (true);
create policy "academy notifications read" on public.academy_notifications for select to anon, authenticated using (true);
create policy "academy notifications write" on public.academy_notifications for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.courses;
alter publication supabase_realtime add table public.course_modules;
alter publication supabase_realtime add table public.lessons;
alter publication supabase_realtime add table public.quizzes;
alter publication supabase_realtime add table public.quiz_results;
alter publication supabase_realtime add table public.enrollments;
alter publication supabase_realtime add table public.certificates;
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_comments;
alter publication supabase_realtime add table public.student_progress;
alter publication supabase_realtime add table public.academy_notifications;
