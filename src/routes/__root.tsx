import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LangProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { CompareProvider } from "@/lib/compare-store";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wayzen — Future Compass | Университеты для студентов СНГ" },
      {
        name: "description",
        content:
          "Wayzen — гид по университетам США, Европы и Азии для иностранных студентов. Требования, баллы, стоимость, гранты и жильё.",
      },
      { property: "og:title", content: "Wayzen — Future Compass | Университеты для студентов СНГ" },
      { property: "og:description", content: "universities around the world/ easy guide" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Wayzen — Future Compass | Университеты для студентов СНГ" },
      { name: "description", content: "universities around the world/ easy guide" },
      { name: "twitter:description", content: "universities around the world/ easy guide" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e548237b-9afd-4ca5-a2db-2beb745d5220/id-preview-1120a53e--38c7c1eb-0f75-4e7c-afe0-afb7031e131e.lovable.app-1776497783795.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e548237b-9afd-4ca5-a2db-2beb745d5220/id-preview-1120a53e--38c7c1eb-0f75-4e7c-afe0-afb7031e131e.lovable.app-1776497783795.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LangProvider>
      <AuthProvider>
        <CompareProvider>
          <Layout />
          <Toaster />
        </CompareProvider>
      </AuthProvider>
    </LangProvider>
  );
}
