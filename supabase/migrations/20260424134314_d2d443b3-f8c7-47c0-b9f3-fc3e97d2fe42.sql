CREATE TABLE public.university_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL,
  reviewed_by uuid,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,

  slug text NOT NULL,
  name_ru text NOT NULL,
  name_en text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  city text,
  description_ru text,
  description_en text,
  requirements_ru text,
  requirements_en text,
  values_ru text,
  values_en text,
  housing_info_ru text,
  housing_info_en text,
  toefl_min integer,
  ielts_min numeric,
  sat_min integer,
  gpa_min numeric,
  admission_rate numeric,
  tuition_usd integer,
  dorm_cost_usd integer,
  rent_cost_usd integer,
  ranking integer,
  has_full_grant boolean NOT NULL DEFAULT false,
  image_url text,
  website_url text,
  famous_alumni text,
  alumni jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.university_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors and admins can submit"
  ON public.university_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by
    AND (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Submitters see own, admins see all"
  ON public.university_submissions FOR SELECT
  USING (
    auth.uid() = submitted_by
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins update submissions"
  ON public.university_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete submissions"
  ON public.university_submissions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_university_submissions_updated_at
  BEFORE UPDATE ON public.university_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();