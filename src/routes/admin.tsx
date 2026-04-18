import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import type { University } from "@/components/UniversityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type FormState = Partial<University> & { region: "usa" | "europe" | "asia" };

const empty: FormState = {
  slug: "",
  name_ru: "",
  name_en: "",
  country: "",
  region: "usa",
  city: "",
  description_ru: "",
  description_en: "",
  requirements_ru: "",
  requirements_en: "",
  toefl_min: null,
  ielts_min: null,
  sat_min: null,
  gpa_min: null,
  values_ru: "",
  values_en: "",
  admission_rate: null,
  tuition_usd: null,
  has_full_grant: false,
  ranking: null,
  housing_info_ru: "",
  housing_info_en: "",
  dorm_cost_usd: null,
  rent_cost_usd: null,
  famous_alumni: "",
  image_url: "",
  website_url: "",
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { t, lang } = useLang();
  const [items, setItems] = useState<University[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const reload = () => {
    supabase
      .from("universities")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
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
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (u: University) => {
    setEditing(u);
    setForm({ ...u, region: u.region as "usa" | "europe" | "asia" });
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

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numOrNull = (v: string) => (v === "" ? null : Number(v));

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
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <Field label="Slug *" value={form.slug ?? ""} onChange={(v) => update("slug", v)} />
              <SelectField
                label="Region *"
                value={form.region}
                onChange={(v) => update("region", v as "usa" | "europe" | "asia")}
                options={[
                  { v: "usa", l: "USA" },
                  { v: "europe", l: "Europe" },
                  { v: "asia", l: "Asia" },
                ]}
              />
              <Field label="Name (RU) *" value={form.name_ru ?? ""} onChange={(v) => update("name_ru", v)} />
              <Field label="Name (EN) *" value={form.name_en ?? ""} onChange={(v) => update("name_en", v)} />
              <Field label="Country *" value={form.country ?? ""} onChange={(v) => update("country", v)} />
              <Field label="City" value={form.city ?? ""} onChange={(v) => update("city", v)} />
              <Field label="Image URL" value={form.image_url ?? ""} onChange={(v) => update("image_url", v)} />
              <Field label="Website URL" value={form.website_url ?? ""} onChange={(v) => update("website_url", v)} />
              <Field
                label="TOEFL min"
                type="number"
                value={form.toefl_min?.toString() ?? ""}
                onChange={(v) => update("toefl_min", numOrNull(v))}
              />
              <Field
                label="IELTS min"
                type="number"
                step="0.5"
                value={form.ielts_min?.toString() ?? ""}
                onChange={(v) => update("ielts_min", numOrNull(v))}
              />
              <Field
                label="SAT min"
                type="number"
                value={form.sat_min?.toString() ?? ""}
                onChange={(v) => update("sat_min", numOrNull(v))}
              />
              <Field
                label="GPA min"
                type="number"
                step="0.01"
                value={form.gpa_min?.toString() ?? ""}
                onChange={(v) => update("gpa_min", numOrNull(v))}
              />
              <Field
                label="Admission rate %"
                type="number"
                step="0.1"
                value={form.admission_rate?.toString() ?? ""}
                onChange={(v) => update("admission_rate", numOrNull(v))}
              />
              <Field
                label="Tuition USD/year"
                type="number"
                value={form.tuition_usd?.toString() ?? ""}
                onChange={(v) => update("tuition_usd", numOrNull(v))}
              />
              <Field
                label="Dorm USD/month"
                type="number"
                value={form.dorm_cost_usd?.toString() ?? ""}
                onChange={(v) => update("dorm_cost_usd", numOrNull(v))}
              />
              <Field
                label="Rent USD/month"
                type="number"
                value={form.rent_cost_usd?.toString() ?? ""}
                onChange={(v) => update("rent_cost_usd", numOrNull(v))}
              />
              <Field
                label="World ranking"
                type="number"
                value={form.ranking?.toString() ?? ""}
                onChange={(v) => update("ranking", numOrNull(v))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.has_full_grant}
                  onChange={(e) => update("has_full_grant", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Full grant available
              </label>
              <TArea label="Description (RU)" value={form.description_ru ?? ""} onChange={(v) => update("description_ru", v)} />
              <TArea label="Description (EN)" value={form.description_en ?? ""} onChange={(v) => update("description_en", v)} />
              <TArea label="Requirements (RU)" value={form.requirements_ru ?? ""} onChange={(v) => update("requirements_ru", v)} />
              <TArea label="Requirements (EN)" value={form.requirements_en ?? ""} onChange={(v) => update("requirements_en", v)} />
              <TArea label="Values (RU)" value={form.values_ru ?? ""} onChange={(v) => update("values_ru", v)} />
              <TArea label="Values (EN)" value={form.values_en ?? ""} onChange={(v) => update("values_en", v)} />
              <TArea label="Housing (RU)" value={form.housing_info_ru ?? ""} onChange={(v) => update("housing_info_ru", v)} />
              <TArea label="Housing (EN)" value={form.housing_info_en ?? ""} onChange={(v) => update("housing_info_en", v)} />
              <TArea label="Famous alumni (legacy text)" value={form.famous_alumni ?? ""} onChange={(v) => update("famous_alumni", v)} />
              <TArea
                label='Alumni JSON: [{"name_ru":"...","name_en":"...","bio_ru":"...","bio_en":"...","year":"...","photo":"https://..."}]'
                value={form.alumni ? JSON.stringify(form.alumni, null, 2) : "[]"}
                onChange={(v) => {
                  try { update("alumni", JSON.parse(v)); } catch { /* ignore until valid */ }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("admin_cancel")}
              </Button>
              <Button onClick={save}>{t("admin_save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}
