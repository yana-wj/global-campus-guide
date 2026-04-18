import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useCompare } from "@/lib/compare-store";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import {
  Award,
  ExternalLink,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  ArrowLeft,
  GitCompare,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/universities/$slug")({
  component: DetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">University not found</p>
    </div>
  ),
});

function Section({
  icon: Icon,
  title,
  children,
  accent,
}: {
  icon: typeof Award;
  title: string;
  children: React.ReactNode;
  accent?: "primary" | "sky" | "sun";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    sky: "bg-sky/15 text-sky",
    sun: "bg-sun/20 text-sun-foreground",
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[accent ?? "primary"]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

function DetailPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useLang();
  const { has, toggle } = useCompare();
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("universities")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setUni(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">{t("loading")}</div>;
  }
  if (!uni) throw notFound();

  const name = lang === "ru" ? uni.name_ru : uni.name_en;
  const desc = lang === "ru" ? uni.description_ru : uni.description_en;
  const reqs = lang === "ru" ? uni.requirements_ru : uni.requirements_en;
  const values = lang === "ru" ? uni.values_ru : uni.values_en;
  const housing = lang === "ru" ? uni.housing_info_ru : uni.housing_info_en;
  const inCompare = has(uni.id);

  return (
    <article>
      {/* Hero */}
      <div className="relative">
        <div className="relative aspect-[16/6] w-full overflow-hidden bg-muted">
          {uni.image_url && (
            <img src={uni.image_url} alt={name} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/universities"
            className="mb-4 inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {uni.country}
                {uni.city && ` · ${uni.city}`}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold text-balance sm:text-4xl">{name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {uni.has_full_grant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sun px-3 py-1 text-xs font-bold text-sun-foreground">
                    <Award className="h-3 w-3" /> {t("full_grant_yes")}
                  </span>
                )}
                {uni.ranking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Trophy className="h-3 w-3" /> #{uni.ranking} {t("world_rank")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {uni.website_url && (
                <Button asChild variant="outline">
                  <a href={uni.website_url} target="_blank" rel="noreferrer">
                    {t("open_site")} <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                variant={inCompare ? "default" : "secondary"}
                onClick={() => toggle(uni.id)}
              >
                {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                {inCompare ? t("compare_remove") : t("compare_pick")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("s_chance")}
            value={uni.admission_rate ? `${uni.admission_rate}%` : "—"}
            accent="primary"
          />
          <StatCard
            label={t("tuition_year")}
            value={uni.tuition_usd ? `$${uni.tuition_usd.toLocaleString()}` : "—"}
            accent="sky"
          />
          <StatCard
            label="TOEFL / IELTS"
            value={`${uni.toefl_min ?? "—"} / ${uni.ielts_min ?? "—"}`}
            accent="sun"
          />
          <StatCard
            label={`SAT · GPA`}
            value={`${uni.sat_min ?? "—"} · ${uni.gpa_min ?? "—"}`}
            accent="primary"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {desc && (
            <Section icon={Sparkles} title={t("s_overview")} accent="primary">
              <p>{desc}</p>
            </Section>
          )}
          {reqs && (
            <Section icon={GraduationCap} title={t("s_requirements")} accent="sky">
              <p className="whitespace-pre-line">{reqs}</p>
            </Section>
          )}
          {values && (
            <Section icon={Heart} title={t("s_values")} accent="sun">
              <p>{values}</p>
            </Section>
          )}
          <Section icon={Wallet} title={t("s_cost")} accent="primary">
            <p>
              {uni.tuition_usd ? `$${uni.tuition_usd.toLocaleString()} ${t("tuition_year")}` : "—"}
              {" · "}
              <span className={uni.has_full_grant ? "text-primary font-semibold" : "text-muted-foreground"}>
                {uni.has_full_grant ? t("full_grant_yes") : t("full_grant_no")}
              </span>
            </p>
          </Section>
          {(housing || uni.dorm_cost_usd || uni.rent_cost_usd) && (
            <Section icon={HomeIcon} title={t("s_housing")} accent="sky">
              {(uni.dorm_cost_usd || uni.rent_cost_usd) && (
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("dorm_cost")}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold text-primary">
                      {uni.dorm_cost_usd ? `$${uni.dorm_cost_usd.toLocaleString()} ${t("per_month")}` : "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("rent_cost")}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold text-sky">
                      {uni.rent_cost_usd ? `$${uni.rent_cost_usd.toLocaleString()} ${t("per_month")}` : "—"}
                    </div>
                  </div>
                </div>
              )}
              {housing && <p>{housing}</p>}
            </Section>
          )}
          {(() => {
            const alumni = (uni.alumni as Array<{
              name_ru: string; name_en: string; bio_ru?: string; bio_en?: string; year?: string; photo?: string;
            }> | null) ?? [];
            if (alumni.length === 0 && !uni.famous_alumni) return null;
            return (
              <Section icon={Users} title={t("s_alumni")} accent="sun">
                {alumni.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {alumni.map((a, i) => {
                      const aname = lang === "ru" ? a.name_ru : a.name_en;
                      const abio = lang === "ru" ? a.bio_ru : a.bio_en;
                      return (
                        <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                          {a.photo && (
                            <img
                              src={a.photo}
                              alt={aname}
                              loading="lazy"
                              className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-sun/40"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-display font-bold leading-tight">{aname}</div>
                            {a.year && a.year !== "—" && (
                              <div className="text-xs text-muted-foreground">{t("alumni_year")} {a.year}</div>
                            )}
                            {abio && <p className="mt-1 text-xs text-foreground/75">{abio}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>{uni.famous_alumni}</p>
                )}
              </Section>
            );
          })()}
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "primary" | "sky" | "sun";
}) {
  const colorMap = {
    primary: "text-primary",
    sky: "text-sky",
    sun: "text-sun-foreground",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${colorMap[accent]}`}>{value}</div>
    </div>
  );
}
