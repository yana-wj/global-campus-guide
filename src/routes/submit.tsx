import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Send } from "lucide-react";
import { toast } from "sonner";
import {
  UniversityFormFields,
  emptyUniForm,
  type UniFormState,
} from "@/components/UniversityFormFields";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
});

type Submission = {
  id: string;
  name_en: string;
  name_ru: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

function SubmitPage() {
  const { user, isEditor, loading } = useAuth();
  const { t, lang } = useLang();
  const [form, setForm] = useState<UniFormState>(emptyUniForm);
  const [submitting, setSubmitting] = useState(false);
  const [mySubs, setMySubs] = useState<Submission[]>([]);

  const reload = () => {
    if (!user) return;
    supabase
      .from("university_submissions")
      .select("id,name_en,name_ru,status,admin_notes,created_at")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setMySubs((data ?? []) as Submission[]));
  };

  useEffect(() => {
    if (isEditor) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditor, user?.id]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">{t("loading")}</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{t("submit_title")}</h1>
        <Button asChild className="mt-6">
          <Link to="/auth">{t("nav_signin")}</Link>
        </Button>
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold">{t("submit_title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("submit_no_access")}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          {lang === "ru" ? "Ваш user ID:" : "Your user ID:"}{" "}
          <code className="rounded bg-muted px-2 py-0.5 text-xs">{user.id}</code>
        </p>
      </div>
    );
  }

  const submit = async () => {
    if (!form.slug || !form.name_ru || !form.name_en || !form.country) {
      toast.error(lang === "ru" ? "Заполните slug, название, страну" : "Fill slug, name, country");
      return;
    }
    setSubmitting(true);
    const payload = { ...form, submitted_by: user.id, status: "pending" };
    const { error } = await supabase.from("university_submissions").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("submit_success"));
    setForm(emptyUniForm);
    reload();
  };

  const statusLabel = (s: string) => {
    if (s === "approved") return t("submit_status_approved");
    if (s === "rejected") return t("submit_status_rejected");
    return t("submit_status_pending");
  };
  const statusClass = (s: string) => {
    if (s === "approved") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    if (s === "rejected") return "bg-destructive/15 text-destructive";
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("submit_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("submit_sub")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <UniversityFormFields form={form} setForm={setForm} />
        <div className="mt-6 flex justify-end">
          <Button onClick={submit} disabled={submitting}>
            <Send className="h-4 w-4" />
            {t("submit_send")}
          </Button>
        </div>
      </div>

      {mySubs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">{t("submit_my")}</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-3 text-left">{lang === "ru" ? "Название" : "Name"}</th>
                  <th className="p-3 text-left">{lang === "ru" ? "Статус" : "Status"}</th>
                  <th className="p-3 text-left">{lang === "ru" ? "Комментарий" : "Notes"}</th>
                </tr>
              </thead>
              <tbody>
                {mySubs.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-3 font-medium">{lang === "ru" ? s.name_ru : s.name_en}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(s.status)}`}>
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.admin_notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
