import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin, useSession } from "@/hooks/useAuth";
import {
  fetchCertifications,
  fetchExperiences,
  fetchProjects,
  fetchSettings,
  fetchSkills,
  portfolioKeys,
} from "@/lib/portfolio";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ashwinraj B Portfolio" },
      { name: "description", content: "Edit the live portfolio content." },
      { property: "og:title", content: "Admin — Ashwinraj B Portfolio" },
      { property: "og:description", content: "Private editing dashboard for the portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

type Row = Record<string, unknown> & { id: string };

function useTable(table: string, key: readonly string[], fetcher: () => Promise<Row[]>) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: fetcher as () => Promise<Row[]> });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, ...rest } = row;
      const { error } = await supabase.from(table as never).update(rest as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from(table as never).insert(row as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { query, save, create, remove };
}

type FieldDef = { key: string; label: string; type?: "text" | "textarea" | "number" | "switch" | "list" };

function RowEditor({
  row,
  fields,
  onSave,
  onDelete,
}: {
  row: Row;
  fields: FieldDef[];
  onSave: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Row>(row);

  return (
    <div className="card-surface space-y-4 rounded-xl p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`space-y-2 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
          >
            <Label htmlFor={`${row.id}-${f.key}`}>{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea
                id={`${row.id}-${f.key}`}
                rows={4}
                value={String(draft[f.key] ?? "")}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              />
            ) : f.type === "switch" ? (
              <div className="pt-1">
                <Switch
                  id={`${row.id}-${f.key}`}
                  checked={Boolean(draft[f.key])}
                  onCheckedChange={(v) => setDraft({ ...draft, [f.key]: v })}
                />
              </div>
            ) : f.type === "list" ? (
              <Input
                id={`${row.id}-${f.key}`}
                value={(draft[f.key] as string[] | undefined)?.join(", ") ?? ""}
                placeholder="Comma separated"
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [f.key]: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
              />
            ) : (
              <Input
                id={`${row.id}-${f.key}`}
                type={f.type === "number" ? "number" : "text"}
                value={String(draft[f.key] ?? "")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onDelete(row.id)}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
        <Button size="sm" onClick={() => onSave(draft)}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>
    </div>
  );
}

function CollectionEditor({
  table,
  queryKey,
  fetcher,
  fields,
  blank,
}: {
  table: string;
  queryKey: readonly string[];
  fetcher: () => Promise<unknown>;
  fields: FieldDef[];
  blank: Record<string, unknown>;
}) {
  const { query, save, create, remove } = useTable(table, queryKey, fetcher as () => Promise<Row[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={() => create.mutate(blank)}>
          <Plus className="h-4 w-4" /> Add new
        </Button>
      </div>
      {query.data?.map((row) => (
        <RowEditor
          key={row.id}
          row={row}
          fields={fields}
          onSave={(r) => save.mutate(r)}
          onDelete={(id) => remove.mutate(id)}
        />
      ))}
    </div>
  );
}

function SettingsEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: portfolioKeys.settings, queryFn: fetchSettings });
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const current = draft ?? (data as unknown as Record<string, unknown> | null);

  const save = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from("site_settings").upsert(row as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: portfolioKeys.settings });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!current) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const fields: FieldDef[] = [
    { key: "full_name", label: "Full name" },
    { key: "location", label: "Location" },
    { key: "headline", label: "Headline", type: "textarea" },
    { key: "tagline", label: "Tagline", type: "textarea" },
    { key: "about", label: "About (blank line between paragraphs)", type: "textarea" },
    { key: "email", label: "Email" },
    { key: "linkedin_url", label: "LinkedIn URL" },
    { key: "github_url", label: "GitHub URL" },
    { key: "resume_url", label: "Résumé URL" },
  ];

  return (
    <div className="card-surface space-y-4 rounded-xl p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={`space-y-2 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.type === "textarea" ? (
              <Textarea
                id={f.key}
                rows={f.key === "about" ? 10 : 3}
                value={String(current[f.key] ?? "")}
                onChange={(e) => setDraft({ ...current, [f.key]: e.target.value })}
              />
            ) : (
              <Input
                id={f.key}
                value={String(current[f.key] ?? "")}
                onChange={(e) => setDraft({ ...current, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={() => save.mutate(current)}>
          <Save className="h-4 w-4" /> Save profile
        </Button>
      </div>
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const isAdmin = useIsAdmin(user?.id);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Content admin</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">View site</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {isAdmin === null ? (
          <p className="text-sm text-muted-foreground">Checking access…</p>
        ) : !isAdmin ? (
          <div className="card-surface rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold">View-only access</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account can browse the portfolio but cannot edit it. Only the owner account has
              editing rights.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Back to portfolio</Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="profile">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="certs">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <SettingsEditor />
            </TabsContent>

            <TabsContent value="experience">
              <CollectionEditor
                table="experiences"
                queryKey={portfolioKeys.experiences}
                fetcher={fetchExperiences}
                blank={{ role: "New role", company: "Company", period: "", description: "", sort_order: 99 }}
                fields={[
                  { key: "role", label: "Role" },
                  { key: "company", label: "Company" },
                  { key: "period", label: "Period" },
                  { key: "sort_order", label: "Order", type: "number" },
                  { key: "description", label: "Description", type: "textarea" },
                ]}
              />
            </TabsContent>

            <TabsContent value="projects">
              <CollectionEditor
                table="projects"
                queryKey={portfolioKeys.projects}
                fetcher={fetchProjects}
                blank={{ title: "New project", summary: "", tech: [], sort_order: 99 }}
                fields={[
                  { key: "title", label: "Title" },
                  { key: "sort_order", label: "Order", type: "number" },
                  { key: "summary", label: "Summary", type: "textarea" },
                  { key: "tech", label: "Tech (comma separated)", type: "list" },
                  { key: "repo_url", label: "Repo URL" },
                  { key: "demo_url", label: "Demo URL" },
                  { key: "featured", label: "Featured", type: "switch" },
                ]}
              />
            </TabsContent>

            <TabsContent value="skills">
              <CollectionEditor
                table="skills"
                queryKey={portfolioKeys.skills}
                fetcher={fetchSkills}
                blank={{ name: "New skill", category: "General", sort_order: 99 }}
                fields={[
                  { key: "name", label: "Skill" },
                  { key: "category", label: "Category" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
              />
            </TabsContent>

            <TabsContent value="certs">
              <CollectionEditor
                table="certifications"
                queryKey={portfolioKeys.certifications}
                fetcher={fetchCertifications}
                blank={{ name: "New certification", issuer: "", year: "", sort_order: 99 }}
                fields={[
                  { key: "name", label: "Name" },
                  { key: "issuer", label: "Issuer" },
                  { key: "year", label: "Year" },
                  { key: "url", label: "Credential URL" },
                  { key: "sort_order", label: "Order", type: "number" },
                ]}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
