import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type AlumniItem = {
  name_ru?: string;
  name_en?: string;
  bio_ru?: string;
  bio_en?: string;
  year?: string;
  photo?: string;
};

export type UniFormState = {
  slug: string;
  region: "usa" | "europe" | "asia";
  name_ru: string;
  name_en: string;
  country: string;
  city: string | null;
  image_url: string | null;
  website_url: string | null;
  description_ru: string | null;
  description_en: string | null;
  requirements_ru: string | null;
  requirements_en: string | null;
  values_ru: string | null;
  values_en: string | null;
  housing_info_ru: string | null;
  housing_info_en: string | null;
  toefl_min: number | null;
  ielts_min: number | null;
  sat_min: number | null;
  gpa_min: number | null;
  admission_rate: number | null;
  tuition_usd: number | null;
  dorm_cost_usd: number | null;
  rent_cost_usd: number | null;
  ranking: number | null;
  has_full_grant: boolean;
  famous_alumni: string | null;
  alumni: AlumniItem[];
};

export const emptyUniForm: UniFormState = {
  slug: "",
  region: "usa",
  name_ru: "",
  name_en: "",
  country: "",
  city: "",
  image_url: "",
  website_url: "",
  description_ru: "",
  description_en: "",
  requirements_ru: "",
  requirements_en: "",
  values_ru: "",
  values_en: "",
  housing_info_ru: "",
  housing_info_en: "",
  toefl_min: null,
  ielts_min: null,
  sat_min: null,
  gpa_min: null,
  admission_rate: null,
  tuition_usd: null,
  dorm_cost_usd: null,
  rent_cost_usd: null,
  ranking: null,
  has_full_grant: false,
  famous_alumni: "",
  alumni: [],
};

const numOrNull = (v: string) => (v === "" ? null : Number(v));

export function UniversityFormFields({
  form,
  setForm,
}: {
  form: UniFormState;
  setForm: Dispatch<SetStateAction<UniFormState>>;
}) {
  const update = <K extends keyof UniFormState>(k: K, v: UniFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid gap-4 py-2 sm:grid-cols-2">
      <Field label="Slug *" value={form.slug} onChange={(v) => update("slug", v)} />
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
      <Field label="Name (RU) *" value={form.name_ru} onChange={(v) => update("name_ru", v)} />
      <Field label="Name (EN) *" value={form.name_en} onChange={(v) => update("name_en", v)} />
      <Field label="Country *" value={form.country} onChange={(v) => update("country", v)} />
      <Field label="City" value={form.city ?? ""} onChange={(v) => update("city", v)} />
      <Field label="Image URL" value={form.image_url ?? ""} onChange={(v) => update("image_url", v)} />
      <Field label="Website URL" value={form.website_url ?? ""} onChange={(v) => update("website_url", v)} />
      <Field label="TOEFL min" type="number" value={form.toefl_min?.toString() ?? ""} onChange={(v) => update("toefl_min", numOrNull(v))} />
      <Field label="IELTS min" type="number" step="0.5" value={form.ielts_min?.toString() ?? ""} onChange={(v) => update("ielts_min", numOrNull(v))} />
      <Field label="SAT min" type="number" value={form.sat_min?.toString() ?? ""} onChange={(v) => update("sat_min", numOrNull(v))} />
      <Field label="GPA min" type="number" step="0.01" value={form.gpa_min?.toString() ?? ""} onChange={(v) => update("gpa_min", numOrNull(v))} />
      <Field label="Admission rate %" type="number" step="0.1" value={form.admission_rate?.toString() ?? ""} onChange={(v) => update("admission_rate", numOrNull(v))} />
      <Field label="Tuition USD/year" type="number" value={form.tuition_usd?.toString() ?? ""} onChange={(v) => update("tuition_usd", numOrNull(v))} />
      <Field label="Dorm USD/month" type="number" value={form.dorm_cost_usd?.toString() ?? ""} onChange={(v) => update("dorm_cost_usd", numOrNull(v))} />
      <Field label="Rent USD/month" type="number" value={form.rent_cost_usd?.toString() ?? ""} onChange={(v) => update("rent_cost_usd", numOrNull(v))} />
      <Field label="World ranking" type="number" value={form.ranking?.toString() ?? ""} onChange={(v) => update("ranking", numOrNull(v))} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.has_full_grant}
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
        value={form.alumni && form.alumni.length ? JSON.stringify(form.alumni, null, 2) : "[]"}
        onChange={(v) => {
          try {
            update("alumni", JSON.parse(v));
          } catch {
            /* ignore until valid */
          }
        }}
      />
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
