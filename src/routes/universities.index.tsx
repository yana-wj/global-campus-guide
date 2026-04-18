import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { UniversityCard, type University } from "@/components/UniversityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Award } from "lucide-react";

type Region = "all" | "usa" | "europe" | "asia";

export const Route = createFileRoute("/universities/")({
  validateSearch: (search: Record<string, unknown>): { region?: Region } => {
    const r = search.region;
    if (r === "usa" || r === "europe" || r === "asia" || r === "all") return { region: r };
    return {};
  },
  component: CatalogPage,
});

function CatalogPage() {
  const { t, lang } = useLang();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const region: Region = search.region ?? "all";
  const [items, setItems] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [grantOnly, setGrantOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("universities")
      .select("*")
      .order("ranking", { ascending: true, nullsFirst: false });
    if (region !== "all") query = query.eq("region", region);
    if (grantOnly) query = query.eq("has_full_grant", true);
    query.then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  }, [region, grantOnly]);

  const filtered = items.filter((u) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      u.name_ru.toLowerCase().includes(s) ||
      u.name_en.toLowerCase().includes(s) ||
      u.country.toLowerCase().includes(s)
    );
  });

  const regions: { id: Region; label: string }[] = [
    { id: "all", label: t("region_all") },
    { id: "usa", label: t("region_usa") },
    { id: "europe", label: t("region_europe") },
    { id: "asia", label: t("region_asia") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("nav_catalog")}</h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "ru"
            ? "Полная база с фильтрами по региону и грантам."
            : "Full database with filters by region and grants."}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("filter_search")}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <Button
              key={r.id}
              variant={region === r.id ? "default" : "outline"}
              size="sm"
              onClick={() => navigate({ search: { region: r.id === "all" ? undefined : r.id } })}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <Button
          variant={grantOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setGrantOnly((v) => !v)}
          className={grantOnly ? "bg-sun text-sun-foreground hover:bg-sun/90" : ""}
        >
          <Award className="h-4 w-4" /> {t("filter_grant")}
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">{t("loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">{t("empty")}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UniversityCard key={u.id} uni={u} />
          ))}
        </div>
      )}
    </div>
  );
}
