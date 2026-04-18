import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useCompare } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";
import { Compass, GitCompare, LogOut, ShieldCheck, LogIn } from "lucide-react";
import { CompareFAB } from "@/components/CompareFAB";

export function Layout() {
  const { lang, setLang, t } = useLang();
  const { user, isAdmin, signOut } = useAuth();
  const { ids } = useCompare();
  const loc = useLocation();

  const linkCls = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active ? "text-primary" : "text-foreground/70 hover:text-foreground"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:rotate-12">
              <Compass className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold">{t("brand")}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("tagline")}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={linkCls(loc.pathname === "/")}>
              {t("nav_home")}
            </Link>
            <Link to="/universities" className={linkCls(loc.pathname.startsWith("/universities"))}>
              {t("nav_catalog")}
            </Link>
            <Link to="/compare" className={linkCls(loc.pathname === "/compare")}>
              <span className="inline-flex items-center gap-1">
                <GitCompare className="h-4 w-4" />
                {t("nav_compare")}
                {ids.length > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sun px-1.5 text-[11px] font-bold text-sun-foreground">
                    {ids.length}
                  </span>
                )}
              </span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className={linkCls(loc.pathname.startsWith("/admin"))}>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {t("nav_admin")}
                </span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-border text-xs">
              <button
                onClick={() => setLang("ru")}
                className={`px-2 py-1 ${lang === "ru" ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
              >
                RU
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 ${lang === "en" ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
              >
                EN
              </button>
            </div>
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_signout")}</span>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav_signin")}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          {t("footer")}
        </div>
      </footer>
    </div>
  );
}
