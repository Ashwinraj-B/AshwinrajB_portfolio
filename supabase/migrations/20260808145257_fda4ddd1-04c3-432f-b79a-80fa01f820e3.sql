-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  full_name text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  resume_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Experiences
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  company text NOT NULL,
  period text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Admins manage experiences" ON public.experiences FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  tech text[] NOT NULL DEFAULT '{}',
  repo_url text NOT NULL DEFAULT '',
  demo_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Skills
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER skills_updated BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Certifications
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Admins manage certifications" ON public.certifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER certifications_updated BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed
INSERT INTO public.site_settings (id, full_name, headline, tagline, about, location, email, linkedin_url, github_url)
VALUES (
  true,
  'Ashwinraj B',
  'AI & Data Science Intern (Corizo, IIT Patna) | Aspiring AI/ML Engineer & Data Scientist',
  'Python • NLP • Machine Learning — B.Tech AI & DS, Panimalar Engineering College',
  E'I''m a B.Tech Artificial Intelligence & Data Science student at Panimalar Engineering College. Over the past year I''ve stacked four internships and trainee programs on top of a full course load: I''m currently a part-time AI & Data Science Trainee at the IIT Patna-affiliated Vishlesan I-Hub Foundation and a Data Science Intern at Corizo Edutech, and I completed earlier internships at CodeAlpha and InternPe (Python, chatbot logic, game logic). I''m also an Internshala Student Partner.\n\nOutside that structured track, I build independently — most substantially TimeForge, an Android productivity app with an AI assistant backed by a hybrid FastAPI service that runs purpose-built ML engines locally and escalates to an LLM when needed. I''m currently running a #100ProjectsChallenge, shipping and documenting real projects one at a time.\n\nLong term, I want to build systems — and eventually a company — at the frontier of applied AI.',
  'Chennai, Tamil Nadu, India',
  '',
  'https://linkedin.com/in/ashwinraj-b-8b9254382',
  ''
);

INSERT INTO public.experiences (role, company, period, description, sort_order) VALUES
('AI & Data Science Trainee', 'Vishlesan I-Hub Foundation (IIT Patna)', 'Aug 2026 – Present', 'Part-time trainee in an IIT Patna-affiliated AI & Data Science program, working through applied machine learning and data workflows.', 1),
('Data Science Intern', 'Corizo Edutech (IBM)', 'Jul 2026 – Present', 'Hands-on data science internship covering Python analysis, model building and reporting on real datasets.', 2),
('Summer Intern', 'InternPe', '2026', 'Built Python game logic and small applications; strengthened core programming and problem-solving fundamentals.', 3),
('Student Intern', 'CodeAlpha', '2026', 'Developed a Python chatbot and completed structured programming tasks with reviewed deliverables.', 4);

INSERT INTO public.projects (title, summary, tech, repo_url, featured, sort_order) VALUES
('TimeForge', 'Android productivity app with an AI assistant. Hybrid backend: a FastAPI service running purpose-built ML engines as the fast local path, escalating to a cloud LLM for harder requests.', ARRAY['Android','FastAPI','Python','LLM','Machine Learning'], '', true, 1),
('Draco AI', 'A neural network built from scratch using Hebbian learning — written before touching a single AI API, to understand how learning actually works under the hood.', ARRAY['Python','NumPy','Neural Networks'], '', true, 2),
('Hand Gesture Recognition', 'Project #1 of my #100ProjectsChallenge: real-time hand-gesture recognition using MediaPipe and OpenCV.', ARRAY['Python','MediaPipe','OpenCV','Computer Vision'], '', true, 3),
('CareerPlanner', 'A structured 42-week career planning tool that turns a long-term goal into weekly, trackable milestones.', ARRAY['Python','Web'], '', false, 4),
('SkillQuiz Pro', 'Quiz platform for skill assessment with a component-driven frontend architecture.', ARRAY['React','TypeScript'], '', false, 5);

INSERT INTO public.skills (name, category, sort_order) VALUES
('Python','Languages',1),('Java','Languages',2),('C++','Languages',3),
('Machine Learning','AI & Data',4),('NLP','AI & Data',5),('Deep Learning','AI & Data',6),
('NumPy','Libraries',7),('pandas','Libraries',8),('Matplotlib','Libraries',9),
('scikit-learn','Libraries',10),('OpenCV','Libraries',11),('MediaPipe','Libraries',12),
('FastAPI','Engineering',13),('Android Development','Engineering',14),('Git & GitHub','Engineering',15);

INSERT INTO public.certifications (name, issuer, year, sort_order) VALUES
('AI & Data Science Certification','IIT Patna / Vishlesan I-Hub Foundation','2026',1),
('Data Science Internship Certification','Corizo Edutech (IBM)','2026',2),
('AI Bootcamp','Intellipaat','2026',3),
('Student Partner Program','Internshala','2026',4);