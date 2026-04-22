
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.plan_type AS ENUM ('mensual', 'semestral', 'anual', 'inactivo');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  plan_type public.plan_type NOT NULL DEFAULT 'inactivo',
  plan_start_date TIMESTAMPTZ,
  plan_end_date TIMESTAMPTZ,
  hotmart_transaction_id TEXT,
  preferencias JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarding_completado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- has_role function (SECURITY DEFINER, prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- has_active_plan function
CREATE OR REPLACE FUNCTION public.has_active_plan(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND plan_type <> 'inactivo'
      AND plan_end_date IS NOT NULL
      AND plan_end_date > now()
  );
$$;

-- recetas
CREATE TABLE public.recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tiempo_minutos INT NOT NULL,
  calorias INT NOT NULL,
  porciones INT NOT NULL DEFAULT 1,
  dificultad TEXT NOT NULL DEFAULT 'facil',
  categoria TEXT NOT NULL,
  badges TEXT[] NOT NULL DEFAULT '{}',
  imagen_url TEXT NOT NULL,
  ingredientes JSONB NOT NULL,
  pasos JSONB NOT NULL,
  tip_nutricionista TEXT,
  info_nutricional JSONB NOT NULL DEFAULT '{}'::jsonb,
  categoria_ingrediente_principal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- favoritos
CREATE TABLE public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receta_id UUID NOT NULL REFERENCES public.recetas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, receta_id)
);

-- recetas_hechas
CREATE TABLE public.recetas_hechas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receta_id UUID NOT NULL REFERENCES public.recetas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating INT CHECK (rating BETWEEN 1 AND 5)
);

-- lista_compras
CREATE TABLE public.lista_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semana DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, semana)
);

-- semana_planificada
CREATE TABLE public.semana_planificada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semana DATE NOT NULL,
  dias JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, semana)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas_hechas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semana_planificada ENABLE ROW LEVEL SECURITY;

-- RLS profiles
CREATE POLICY "users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS user_roles
CREATE POLICY "users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS recetas (only active plan or admin)
CREATE POLICY "active plan users can view recetas" ON public.recetas
  FOR SELECT TO authenticated USING (
    public.has_active_plan(auth.uid()) OR public.has_role(auth.uid(), 'admin')
  );

-- RLS favoritos
CREATE POLICY "users manage own favoritos select" ON public.favoritos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own favoritos insert" ON public.favoritos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users manage own favoritos delete" ON public.favoritos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS recetas_hechas
CREATE POLICY "users manage own hechas select" ON public.recetas_hechas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own hechas insert" ON public.recetas_hechas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users manage own hechas update" ON public.recetas_hechas
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own hechas delete" ON public.recetas_hechas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS lista_compras
CREATE POLICY "users manage own lista select" ON public.lista_compras
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own lista insert" ON public.lista_compras
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users manage own lista update" ON public.lista_compras
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own lista delete" ON public.lista_compras
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS semana_planificada
CREATE POLICY "users manage own semana select" ON public.semana_planificada
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own semana insert" ON public.semana_planificada
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users manage own semana update" ON public.semana_planificada
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users manage own semana delete" ON public.semana_planificada
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NULL),
    'inactivo'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_recetas_categoria ON public.recetas(categoria);
CREATE INDEX idx_recetas_badges ON public.recetas USING GIN(badges);
CREATE INDEX idx_favoritos_user ON public.favoritos(user_id);
CREATE INDEX idx_hechas_user ON public.recetas_hechas(user_id);
