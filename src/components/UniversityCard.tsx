import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { useCompare } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";
import { Award, MapPin, GitCompare, Check } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type University = Database["public"]["Tables"]["universities"]["Row"];

export function UniversityCard({ uni }: { uni: University }) {
  const { lang, t } = useLang();
  const { has, toggle } = useCompare();
  const inCompare = has(uni.id);
  const name = lang === "ru" ? uni.name_ru : uni.name_en;
  const desc = lang === "ru" ? uni.description_ru : uni.description_en;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link to="/universities/$slug" params={{ slug: uni.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {uni.image_url && (
            <img
              src={uni.image_url}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {uni.has_full_grant && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-sun px-2.5 py-1 text-xs font-bold text-sun-foreground shadow-sm">
              <Award className="h-3 w-3" />
              {t("full_grant_yes")}
            </div>
          )}
          {uni.ranking && (
            <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur">
              #{uni.ranking}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link to="/universities/$slug" params={{ slug: uni.slug }}>
            <h3 className="font-display text-lg font-bold leading-tight text-balance hover:text-primary">
              {name}
            </h3>
          </Link>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {uni.country}
            {uni.city && ` · ${uni.city}`}
          </div>
        </div>

        {desc && <p className="line-clamp-2 text-sm text-muted-foreground">{desc}</p>}

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center text-xs">
          <div>
            <div className="font-bold text-primary">
              {uni.admission_rate ? `${uni.admission_rate}%` : "—"}
            </div>
            <div className="text-muted-foreground">{t("admission")}</div>
          </div>
          <div>
            <div className="font-bold text-sky">
              {uni.tuition_usd ? `$${(uni.tuition_usd / 1000).toFixed(0)}k` : "—"}
            </div>
            <div className="text-muted-foreground">{t("tuition_year")}</div>
          </div>
          <div>
            <div className="font-bold text-foreground">
              {uni.toefl_min ?? "—"}
            </div>
            <div className="text-muted-foreground">TOEFL</div>
          </div>
        </div>

        <Button
          variant={inCompare ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            toggle(uni.id);
          }}
        >
          {inCompare ? (
            <>
              <Check className="h-4 w-4" /> {t("compare_remove")}
            </>
          ) : (
            <>
              <GitCompare className="h-4 w-4" /> {t("compare_pick")}
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
