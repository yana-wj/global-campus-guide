import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/components/UniversityCard";
import { UniversityCard } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import { Heart, Clock, LogOut, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type HistoryRow = {
  id: string;
  viewed_at: string;
  university: University | null;
};

function ProfilePage() {
  const { user, isOwner, isAdmin, isEditor, loading, signOut } = useAuth();
  const { t, lang } = useLang();
  const [favs, setFavs] = useState<University[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const reload = async () => {
    if (!user) return;
    const [favsRes, histRes] = await Promise.all([
      supabase
        .from("favorites")
        .select("created_at, universities(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("view_history")
        .select("id, viewed_at, universities(*)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(50),
    ]);
    setFavs(((favsRes.data ?? []) as Array<{ universities: University | null }>)
      .map((r) => r.universities)
      .filter((u): u is University => !!u));
    setHistory(
      ((histRes.data ?? []) as Array<{ id: string; viewed_at: string; universities: University | null }>).map(
        (r) => ({ id: r.id, viewed_at: r.viewed_at, university: r.universities })
      )
    );
  };

  useEffect(() => {
    if (user) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">{t("loading")}</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{t("profile_title")}</h1>
        <Button asChild className="mt-6">
          <Link to="/auth">{t("nav_signin")}</Link>
        </Button>
      </div>
    );
  }

  const clearHistory = async () => {
    if (!confirm(lang === "ru" ? "Очистить всю историю?" : "Clear all history?")) return;
    const { error } = await supabase.from("view_history").delete().eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHistory([]);
    toast.success(lang === "ru" ? "История очищена" : "History cleared");
  };

  const roleLabel = () => {
    if (isOwner) return t("staff_role_owner");
    if (isAdmin) return t("staff_role_admin");
    if (isEditor) return t("staff_role_editor");
    return lang === "ru" ? "Пользователь" : "User";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t("profile_title")}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {roleLabel()}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          {t("nav_signout")}
        </Button>
      </div>

      {/* Favorites */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-destructive" />
          <h2 className="font-display text-xl font-bold">{t("profile_favorites")}</h2>
          {favs.length > 0 && (
            <span className="text-sm text-muted-foreground">({favs.length})</span>
          )}
        </div>
        {favs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {t("profile_no_favorites")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((u) => (
              <UniversityCard key={u.id} uni={u} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">{t("profile_history")}</h2>
            {history.length > 0 && (
              <span className="text-sm text-muted-foreground">({history.length})</span>
            )}
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4" />
              {t("profile_clear_history")}
            </Button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {t("profile_no_history")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {history.map((h) =>
                h.university ? (
                  <li key={h.id}>
                    <Link
                      to="/universities/$slug"
                      params={{ slug: h.university.slug }}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                    >
                      {h.university.image_url && (
                        <img
                          src={h.university.image_url}
                          alt=""
                          loading="lazy"
                          className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">
                          {lang === "ru" ? h.university.name_ru : h.university.name_en}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {h.university.country}
                          {h.university.city && ` · ${h.university.city}`}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {new Date(h.viewed_at).toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
