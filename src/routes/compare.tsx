import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useCompare } from "@/lib/compare-store";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import { X, Check, Award } from "lucide-react";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const { t, lang } = useLang();
  const { ids, toggle, clear } = useCompare();
  const [items, setItems] = useState<University[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    supabase
      .from("universities")
      .select("*")
      .in("id", ids)
      .then(({ data }) => setItems(data ?? []));
  }, [ids]);

  const rows: { label: string; render: (u: University) => React.ReactNode }[] = [
    { label: lang === "ru" ? "Страна" : "Country", render: (u) => `${u.country}${u.city ? ", " + u.city : ""}` },
    { label: t("s_ranking"), render: (u) => (u.ranking ? `#${u.ranking}` : "—") },
    { label: t("s_chance"), render: (u) => (u.admission_rate ? `${u.admission_rate}%` : "—") },
    { label: t("tuition_year"), render: (u) => (u.tuition_usd ? `$${u.tuition_usd.toLocaleString()}` : "—") },
    {
      label: t("full_grant_yes"),
      render: (u) =>
        u.has_full_grant ? (
          <Check className="h-5 w-5 text-primary" />
        ) : (
          <X className="h-5 w-5 text-muted-foreground" />
        ),
    },
    { label: "TOEFL", render: (u) => u.toefl_min ?? "—" },
    { label: "IELTS", render: (u) => u.ielts_min ?? "—" },
    { label: "SAT", render: (u) => u.sat_min ?? "—" },
    { label: "GPA", render: (u) => u.gpa_min ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("compare_title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("compare_sub")}</p>
        </div>
        {ids.length > 0 && (
          <Button variant="outline" onClick={clear}>
            <X className="h-4 w-4" /> {t("compare_clear")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <p className="text-muted-foreground">
            {lang === "ru"
              ? "Добавьте до 3 университетов из каталога"
              : "Add up to 3 universities from the catalog"}
          </p>
          <Button asChild className="mt-4">
            <Link to="/universities">{t("nav_catalog")}</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground"> </th>
                {items.map((u) => (
                  <th key={u.id} className="p-4 text-left">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Link
                          to="/universities/$slug"
                          params={{ slug: u.slug }}
                          className="font-display text-base font-bold hover:text-primary"
                        >
                          {lang === "ru" ? u.name_ru : u.name_en}
                        </Link>
                        {u.has_full_grant && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold text-sun-foreground">
                            <Award className="h-3 w-3" />
                            {lang === "ru" ? "Грант" : "Grant"}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => toggle(u.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-muted/20" : ""}>
                  <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                  {items.map((u) => (
                    <td key={u.id} className="p-4">
                      {row.render(u)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
