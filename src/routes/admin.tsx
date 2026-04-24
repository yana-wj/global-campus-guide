import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ShieldAlert, Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";
import {
  UniversityFormFields,
  emptyUniForm,
  type UniFormState,
} from "@/components/UniversityFormFields";
import { StaffManagement } from "@/components/StaffManagement";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Submission = UniFormState & {
  id: string;
  submitted_by: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

function AdminPage() {
  const { user, isAdmin, isOwner, loading } = useAuth();
  const { t, lang } = useLang();
  const [items, setItems] = useState<University[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState<UniFormState>(emptyUniForm);

  const [pending, setPending] = useState<Submission[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [reviewForm, setReviewForm] = useState<UniFormState>(emptyUniForm);
  const [adminNotes, setAdminNotes] = useState("");

  const reload = () => {
    supabase
      .from("universities")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
    supabase
      .from("university_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPending((data ?? []) as Submission[]));
  };

  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">{t("loading")}</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold">{t("admin_no_access")}</h1>
        {!user && (
          <Button asChild className="mt-6">
            <Link to="/auth">{t("nav_signin")}</Link>
          </Button>
        )}
        {user && (
          <p className="mt-4 text-sm text-muted-foreground">
            {lang === "ru" ? "Ваш user ID:" : "Your user ID:"}{" "}
            <code className="rounded bg-muted px-2 py-0.5 text-xs">{user.id}</code>
          </p>
        )}
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setForm(emptyUniForm);
    setOpen(true);
  };
  const openEdit = (u: University) => {
    setEditing(u);
    setForm({
      ...emptyUniForm,
      ...u,
      region: u.region as "usa" | "europe" | "asia",
      alumni: Array.isArray(u.alumni) ? (u.alumni as never as UniFormState["alumni"]) : [],
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug || !form.name_ru || !form.name_en || !form.country) {
      toast.error("slug, name, country required");
      return;
    }
    const payload = { ...form } as never;
    const { error } = editing
      ? await supabase.from("universities").update(payload).eq("id", editing.id)
      : await supabase.from("universities").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setOpen(false);
    reload();
  };

  const remove = async (u: University) => {
    if (!confirm(`Delete ${u.name_en}?`)) return;
    const { error } = await supabase.from("universities").delete().eq("id", u.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    reload();
  };

  const openReview = (s: Submission) => {
    setReviewing(s);
    setReviewForm({
      ...emptyUniForm,
      slug: s.slug,
      region: (s.region as "usa" | "europe" | "asia") ?? "usa",
      name_ru: s.name_ru,
      name_en: s.name_en,
      country: s.country,
      city: s.city,
      image_url: s.image_url,
      website_url: s.website_url,
      description_ru: s.description_ru,
      description_en: s.description_en,
      requirements_ru: s.requirements_ru,
      requirements_en: s.requirements_en,
      values_ru: s.values_ru,
      values_en: s.values_en,
      housing_info_ru: s.housing_info_ru,
      housing_info_en: s.housing_info_en,
      toefl_min: s.toefl_min,
      ielts_min: s.ielts_min,
      sat_min: s.sat_min,
      gpa_min: s.gpa_min,
      admission_rate: s.admission_rate,
      tuition_usd: s.tuition_usd,
      dorm_cost_usd: s.dorm_cost_usd,
      rent_cost_usd: s.rent_cost_usd,
      ranking: s.ranking,
      has_full_grant: !!s.has_full_grant,
      famous_alumni: s.famous_alumni,
      alumni: Array.isArray(s.alumni) ? s.alumni : [],
    });
    setAdminNotes(s.admin_notes ?? "");
    setReviewOpen(true);
  };

  const approve = async () => {
    if (!reviewing) return;
    if (!reviewForm.slug || !reviewForm.name_ru || !reviewForm.name_en || !reviewForm.country) {
      toast.error("slug, name, country required");
      return;
    }
    const { error: insErr } = await supabase
      .from("universities")
      .insert({ ...reviewForm } as never);
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    const { error: updErr } = await supabase
      .from("university_submissions")
      .update({
        status: "approved",
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reviewing.id);
    if (updErr) {
      toast.error(updErr.message);
      return;
    }
    toast.success(lang === "ru" ? "Опубликовано" : "Published");
    setReviewOpen(false);
    setReviewing(null);
    reload();
  };

  const reject = async () => {
    if (!reviewing) return;
    const { error } = await supabase
      .from("university_submissions")
      .update({
        status: "rejected",
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reviewing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(lang === "ru" ? "Отклонено" : "Rejected");
    setReviewOpen(false);
    setReviewing(null);
    reload();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("admin_title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} universities</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> {t("admin_add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? t("admin_edit") : t("admin_add")}</DialogTitle>
            </DialogHeader>
            <UniversityFormFields form={form} setForm={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("admin_cancel")}
              </Button>
              <Button onClick={save}>{t("admin_save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Submissions inbox */}
      <div className="mb-10 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">{t("admin_submissions")}</h2>
          {pending.length > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("admin_no_pending")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-3 text-left">{lang === "ru" ? "Название" : "Name"}</th>
                <th className="p-3 text-left">{lang === "ru" ? "Страна" : "Country"}</th>
                <th className="p-3 text-left">{lang === "ru" ? "Дата" : "Date"}</th>
                <th className="p-3 text-right">{lang === "ru" ? "Действие" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.name_en}</td>
                  <td className="p-3 text-muted-foreground">{s.country}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" onClick={() => openReview(s)}>
                      {t("admin_review")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin_review")}: {reviewing?.name_en}</DialogTitle>
          </DialogHeader>
          <UniversityFormFields form={reviewForm} setForm={setReviewForm} />
          <div className="mt-3">
            <Label>{t("admin_notes")}</Label>
            <Textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={lang === "ru" ? "Что улучшить или почему отклонено..." : "What to improve or why rejected..."}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              {t("admin_cancel")}
            </Button>
            <Button variant="destructive" onClick={reject}>
              <X className="h-4 w-4" /> {t("admin_reject")}
            </Button>
            <Button onClick={approve}>
              <Check className="h-4 w-4" /> {t("admin_approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Country</th>
              <th className="p-3 text-left">Region</th>
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Grant</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.name_en}</td>
                <td className="p-3 text-muted-foreground">{u.country}</td>
                <td className="p-3 uppercase text-xs text-muted-foreground">{u.region}</td>
                <td className="p-3">{u.ranking ?? "—"}</td>
                <td className="p-3">{u.has_full_grant ? "✓" : "—"}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(u)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
