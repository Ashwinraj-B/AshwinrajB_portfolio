import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: boolean;
  full_name: string;
  headline: string;
  tagline: string;
  about: string;
  location: string;
  email: string;
  linkedin_url: string;
  github_url: string;
  resume_url: string;
  avatar_path: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  sort_order: number;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  tech: string[];
  repo_url: string;
  demo_url: string;
  featured: boolean;
  sort_order: number;
  image_path: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  sort_order: number;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string;
  sort_order: number;
  file_path: string;
  file_type: string;
  file_size: number;
};

export const portfolioKeys = {
  settings: ["site_settings"] as const,
  experiences: ["experiences"] as const,
  projects: ["projects"] as const,
  skills: ["skills"] as const,
  certifications: ["certifications"] as const,
};

export async function fetchSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw error;
  return data as SiteSettings | null;
}

export async function fetchExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Experience[];
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Skill[];
}

export async function fetchCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Certification[];
}