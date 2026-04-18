import { Link, useLocation } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { useCompare } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";
import { GitCompare, ArrowRight } from "lucide-react";

export function CompareFAB() {
  const { lang, t } = useLang();
  const { ids } = useCompare();
  const loc = useLocation();

  if (ids.length === 0 || loc.pathname === "/compare") return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
      <Button
        asChild
        size="lg"
        className="gap-2 rounded-full px-5 shadow-lg shadow-primary/30"
      >
        <Link to="/compare">
          <GitCompare className="h-4 w-4" />
          {lang === "ru" ? "Сравнить выбранные" : "Compare selected"}
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sun px-2 text-xs font-bold text-sun-foreground">
            {ids.length}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
