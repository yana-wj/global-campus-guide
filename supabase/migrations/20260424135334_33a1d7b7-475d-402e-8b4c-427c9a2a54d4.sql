-- ========= Owner protection =========
-- Block deletion of owner role
CREATE OR REPLACE FUNCTION public.protect_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove owner role';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER protect_owner_role_trigger
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_owner_role();

-- Block updates that would change someone's role away from owner
CREATE OR REPLACE FUNCTION public.protect_owner_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN
    RAISE EXCEPTION 'Cannot change owner role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_owner_update_trigger
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_owner_update();

-- ========= Owner-only role management RPCs =========
CREATE OR REPLACE FUNCTION public.grant_role_by_email(_email text, _role app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only the owner can grant roles';
  END IF;
  IF _role = 'owner' THEN
    RAISE EXCEPTION 'Cannot grant owner role';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. They must register first.', _email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN target_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_role_by_email(_email text, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only the owner can revoke roles';
  END IF;
  IF _role = 'owner' THEN
    RAISE EXCEPTION 'Cannot revoke owner role';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_id AND role = _role;
END;
$$;

-- List role assignments with email (owner only)
CREATE OR REPLACE FUNCTION public.list_staff_roles()
RETURNS TABLE (user_id uuid, email text, role app_role, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only the owner can view staff roles';
  END IF;

  RETURN QUERY
  SELECT ur.user_id, u.email::text, ur.role, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role IN ('owner', 'admin', 'editor')
  ORDER BY ur.created_at DESC;
END;
$$;

-- ========= Owner bootstrap =========
-- Auto-grant owner role to izaash0099@gmail.com on signup, and grant now if already exists
CREATE OR REPLACE FUNCTION public.assign_owner_if_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'izaash0099@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_owner_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_owner_if_email();

-- Grant immediately if user already exists
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email) = 'izaash0099@gmail.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'owner')
      ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ========= Favorites =========
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, university_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users add own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_favorites_user ON public.favorites(user_id, created_at DESC);

-- ========= View history =========
CREATE TABLE public.view_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.view_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own history"
  ON public.view_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users add own history"
  ON public.view_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users clear own history"
  ON public.view_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_view_history_user ON public.view_history(user_id, viewed_at DESC);

-- Keep only last 50 entries per user
CREATE OR REPLACE FUNCTION public.trim_view_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.view_history
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.view_history
      WHERE user_id = NEW.user_id
      ORDER BY viewed_at DESC
      LIMIT 50
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trim_view_history_trigger
  AFTER INSERT ON public.view_history
  FOR EACH ROW
  EXECUTE FUNCTION public.trim_view_history();