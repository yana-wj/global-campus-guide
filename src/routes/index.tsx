import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { UniversityCard, type University } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, GraduationCap, Home as HomeIcon, Globe2, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useLang();
  const [featured, setFeatured] = useState<University[]>([]);

  useEffect(() => {
    supabase
      .from("universities")
      .select("*")
      .order("ranking", { ascending: true, nullsFirst: false })
      .limit(6)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  const regions = [
    { id: "usa", label: t("region_usa"), icon: "🇺🇸", color: "from-sky/40 to-sky/10" },
    { id: "europe", label: t("region_europe"), icon: "🇪🇺", color: "from-primary/40 to-primary/10" },
    { id: "asia", label: t("region_asia"), icon: "🌏", color: "from-sun/40 to-sun/10" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
              <Compass className="h-3.5 w-3.5 text-primary" />
              {t("brand")} · {t("tagline")}
            </div>
            <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl md:text-6xl">
              {t("hero_title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              {t("hero_sub")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/universities">
                  {t("hero_cta")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/compare">{t("hero_cta2")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {regions.map((r) => (
            <Link
              key={r.id}
              to="/universities"
              search={{ region: r.id as "usa" | "europe" | "asia" }}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${r.color} p-6 transition-all hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="text-3xl">{r.icon}</div>
              <h3 className="mt-3 font-display text-xl font-bold">{r.label}</h3>
              <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:text-primary">
                {lang === "ru" ? "Смотреть вузы" : "View universities"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: GraduationCap, label: lang === "ru" ? "Требования и баллы" : "Requirements & scores" },
            { icon: Award, label: lang === "ru" ? "Полные гранты" : "Full grants" },
            { icon: HomeIcon, label: lang === "ru" ? "Жильё для иностранцев" : "Housing for internationals" },
            { icon: Globe2, label: lang === "ru" ? "США · Европа · Азия" : "USA · Europe · Asia" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-sm font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold">
            {lang === "ru" ? "Топ университеты" : "Top universities"}
          </h2>
          <Link to="/universities" className="text-sm font-medium text-primary hover:underline">
            {lang === "ru" ? "Все →" : "All →"}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((u) => (
            <UniversityCard key={u.id} uni={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
