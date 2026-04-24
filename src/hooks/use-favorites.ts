import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useFavorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      setLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("favorites")
      .select("university_id")
      .eq("user_id", user.id);
    setIds(new Set((data ?? []).map((r) => r.university_id as string)));
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(
    async (universityId: string) => {
      if (!user) return false;
      if (ids.has(universityId)) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("university_id", universityId);
        setIds((prev) => {
          const n = new Set(prev);
          n.delete(universityId);
          return n;
        });
        return false;
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, university_id: universityId });
        setIds((prev) => new Set(prev).add(universityId));
        return true;
      }
    },
    [user, ids]
  );

  return { ids, has: (id: string) => ids.has(id), toggle, loaded, reload };
}
