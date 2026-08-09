import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileText, Github, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCertifications,
  fetchExperiences,
  fetchProjects,
  fetchSettings,
  fetchSkills,
  portfolioKeys,
} from "@/lib/portfolio";
import { CERTIFICATES_BUCKET, MEDIA_BUCKET, getPublicUrl } from "@/lib/storage";
import { useIsAdmin, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ashwinraj B — AI & Data Science Engineer Portfolio" },
      {
        name: "description",
        content:
          "Portfolio of Ashwinraj B: AI & Data Science student, Corizo and IIT Patna intern, building ML systems, Android apps and the #100ProjectsChallenge.",
      },
      { property: "og:title", content: "Ashwinraj B — AI & Data Science Engineer Portfolio" },
      {
        property: "og:description",
        content:
          "AI/ML projects, internships, skills and certifications — a live portfolio built by Ashwinraj B.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-10 flex items-baseline gap-4">
      <span className="font-mono text-sm text-primary">{index}</span>
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      <span className="rule-line hidden h-px flex-1 sm:block" />
    </div>
  );
}

function Home() {
  const { user } = useSession();
  const isAdmin = useIsAdmin(user?.id);

  const settings = useQuery({ queryKey: portfolioKeys.settings, queryFn: fetchSettings });
  const experiences = useQuery({ queryKey: portfolioKeys.experiences, queryFn: fetchExperiences });
  const projects = useQuery({ queryKey: portfolioKeys.projects, queryFn: fetchProjects });
  const skills = useQuery({ queryKey: portfolioKeys.skills, queryFn: fetchSkills });
  const certs = useQuery({ queryKey: portfolioKeys.certifications, queryFn: fetchCertifications });

  const s = settings.data;
  const categories = Array.from(new Set((skills.data ?? []).map((k) => k.category)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-sm font-semibold tracking-tight">
            {s?.full_name || "Portfolio"}
          </span>
          <div className="flex items-center gap-1 text-sm">
            <a
              className="hidden px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:block"
              href="#work"
            >
              Work
            </a>
            <a
              className="hidden px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:block"
              href="#projects"
            >
              Projects
            </a>
            <a
              className="hidden px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:block"
              href="#skills"
            >
              Skills
            </a>
            {isAdmin ? (
              <Button asChild size="sm" variant="secondary">
                <Link to="/admin">Admin</Link>
              </Button>
            ) : null}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="hero-surface -mx-6 px-6 py-20 sm:py-28">
          {settings.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-14 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {s?.avatar_path ? (
                  <img
                    src={getPublicUrl(MEDIA_BUCKET, s.avatar_path)}
                    alt={s.full_name}
                    className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-border sm:h-28 sm:w-28"
                  />
                ) : null}
                <div>
                  <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Open to AI / ML & Data Science roles
                  </p>
                  <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] sm:text-6xl">
                    {s?.full_name}
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-lg text-foreground/90">{s?.headline}</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{s?.tagline}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {s?.email ? (
                  <Button asChild>
                    <a href={`mailto:${s.email}`}>
                      <Mail className="h-4 w-4" /> Get in touch
                    </a>
                  </Button>
                ) : null}
                {s?.linkedin_url ? (
                  <Button asChild variant="secondary">
                    <a href={s.linkedin_url} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  </Button>
                ) : null}
                {s?.github_url ? (
                  <Button asChild variant="secondary">
                    <a href={s.github_url} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  </Button>
                ) : null}
                {s?.resume_url ? (
                  <Button asChild variant="ghost">
                    <a href={s.resume_url} target="_blank" rel="noreferrer">
                      Résumé <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </div>

              {s?.location ? (
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {s.location}
                </p>
              ) : null}
            </>
          )}
        </section>

        {/* About */}
        {s?.about ? (
          <section className="py-16" id="about">
            <SectionHeading index="01" title="About" />
            <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
              {s.about
                .split("\n")
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </section>
        ) : null}

        {/* Experience */}
        <section className="py-16" id="work">
          <SectionHeading index="02" title="Experience" />
          <div className="space-y-4">
            {experiences.data?.map((exp) => (
              <article key={exp.id} className="card-surface rounded-xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{exp.role}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
                </div>
                <p className="mt-1 text-sm text-primary">{exp.company}</p>
                {exp.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="py-16" id="projects">
          <SectionHeading index="03" title="Projects" />
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.data?.map((p) => (
              <article
                key={p.id}
                className={`card-surface overflow-hidden rounded-xl transition-shadow hover:glow-ring ${p.featured ? "sm:col-span-2" : ""
                  }`}
              >
                {p.image_path ? (
                  <img
                    src={getPublicUrl(MEDIA_BUCKET, p.image_path)}
                    alt={p.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    {p.featured ? <Badge variant="secondary">Featured</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                  {p.tech?.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <li
                          key={t}
                          className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-4 flex gap-3 text-sm">
                    {p.repo_url ? (
                      <a
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Code <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    {p.demo_url ? (
                      <a
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                        href={p.demo_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Live demo <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="py-16" id="skills">
          <SectionHeading index="04" title="Skills" />
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat) => (
              <div key={cat} className="card-surface rounded-xl p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {(skills.data ?? [])
                    .filter((k) => k.category === cat)
                    .map((k) => (
                      <li
                        key={k.id}
                        className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                      >
                        {k.name}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        {certs.data?.length ? (
          <section className="py-16" id="certifications">
            <SectionHeading index="05" title="Certifications" />
            <ul className="divide-y divide-border rounded-xl border border-border">
              {certs.data.map((c) => {
                const fileUrl = c.file_path ? getPublicUrl(CERTIFICATES_BUCKET, c.file_path) : "";
                const isPdf = c.file_type === "application/pdf";
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {fileUrl ? (
                        isPdf ? (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                            <FileText className="h-5 w-5" />
                          </span>
                        ) : (
                          <img
                            src={fileUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-md object-cover"
                          />
                        )
                      ) : null}
                      <div>
                        <p className="font-medium">
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-primary"
                            >
                              {c.name}
                            </a>
                          ) : (
                            c.name
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{c.issuer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View certificate <ArrowUpRight className="h-3 w-3" />
                        </a>
                      ) : null}
                      <span className="font-mono text-xs text-muted-foreground">{c.year}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>

      <footer className="mt-10 border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {s?.full_name}
          </p>
        </div>
      </footer>
    </div>
  );
}