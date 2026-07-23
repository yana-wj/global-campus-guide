
-- 1) Profiles: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2) Revoke EXECUTE from anon on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.grant_role_by_email(text, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.revoke_role_by_email(text, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_staff_roles() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.protect_owner_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.protect_owner_update() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.assign_owner_if_email() FROM anon, authenticated, public;

-- has_role must remain callable by authenticated (used in RLS policies and app)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
-- Owner-only RPCs: keep authenticated (they self-check owner internally)
GRANT EXECUTE ON FUNCTION public.grant_role_by_email(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_role_by_email(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_staff_roles() TO authenticated;
