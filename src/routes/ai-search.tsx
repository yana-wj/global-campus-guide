import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { AiChat } from "@/components/AiChat";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-search")({
  component: AiSearchPage,
});

type CatalogItem = {
  slug: string;
  name: string;
  country: string;
  region: string;
  ranking: number | null;
  tuition_usd: number | null;
  has_full_grant: boolean;
  admission_rate: number | null;
};

function AiSearchPage() {
  const { lang, t } = useLang();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  useEffect(() => {
    supabase
      .from("universities")
      .select("slug,name_ru,name_en,country,region,ranking,tuition_usd,has_full_grant,admission_rate")
      .then(({ data }) => {
        setCatalog(
          (data ?? []).map((u) => ({
            slug: u.slug,
            name: lang === "ru" ? u.name_ru : u.name_en,
            country: u.country,
            region: u.region,
            ranking: u.ranking,
            tuition_usd: u.tuition_usd,
            has_full_grant: u.has_full_grant,
            admission_rate: u.admission_rate,
          })),
        );
      });
  }, [lang]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {lang === "ru" ? "Подбор вуза с AI" : "AI university matcher"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "ru"
            ? "Опишите свои интересы, баллы и бюджет — AI предложит подходящие вузы из нашей базы."
            : "Describe your interests, scores and budget — AI will suggest matches from our catalog."}
        </p>
      </div>

      <AiChat
        mode="search"
        catalog={catalog}
        intro={
          <p>
            {t("ai_intro_search")}
          </p>
        }
      />
    </div>
  );
}
