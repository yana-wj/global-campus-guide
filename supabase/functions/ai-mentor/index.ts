// AI mentor — answers questions about a specific university and gives
// suggestions on how to strengthen the user's case. Streaming SSE.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Msg = { role: "user" | "assistant"; content: string };

interface Body {
  messages: Msg[];
  university?: {
    name?: string;
    country?: string;
    city?: string | null;
    ranking?: number | null;
    admission_rate?: number | null;
    tuition_usd?: number | null;
    toefl_min?: number | null;
    ielts_min?: number | null;
    sat_min?: number | null;
    gpa_min?: number | null;
    has_full_grant?: boolean;
    requirements?: string | null;
    values?: string | null;
    description?: string | null;
  };
  lang?: "ru" | "en";
  mode?: "mentor" | "search";
  catalog?: Array<{
    slug: string;
    name: string;
    country: string;
    region: string;
    ranking: number | null;
    tuition_usd: number | null;
    has_full_grant: boolean;
    admission_rate: number | null;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = body.lang === "en" ? "en" : "ru";
    const mode = body.mode ?? "mentor";

    let systemPrompt: string;
    if (mode === "search" && body.catalog) {
      const catalogText = body.catalog
        .slice(0, 200)
        .map(
          (u) =>
            `- ${u.name} [${u.slug}] · ${u.country} · ${u.region} · rank ${u.ranking ?? "—"} · $${u.tuition_usd ?? "—"}/yr · adm ${u.admission_rate ?? "—"}% · grant ${u.has_full_grant ? "yes" : "no"}`,
        )
        .join("\n");
      systemPrompt =
        lang === "ru"
          ? `Ты — AI-консультант по поступлению в вузы. У тебя есть каталог:\n${catalogText}\n\nПо описанию профиля студента предложи 3–5 наиболее подходящих вузов ИЗ КАТАЛОГА (используй точные slug-и в формате [slug]). Объясняй коротко, по-доброму. ОБЯЗАТЕЛЬНО в конце ответа добавь предупреждение, что это рекомендации искусственного интеллекта и для точного решения лучше обратиться к живому ментору или приёмной комиссии вуза.`
          : `You are an AI college-admission consultant. Catalog:\n${catalogText}\n\nGiven a student's profile, suggest 3–5 best-fit universities FROM THE CATALOG (use the exact [slug]). Be concise and warm. ALWAYS end with a disclaimer that this is AI advice and the student should also consult a real mentor or the university's admissions office.`;
    } else {
      const u = body.university ?? {};
      const uniSummary = `Name: ${u.name ?? ""}
Location: ${u.country ?? ""}${u.city ? ", " + u.city : ""}
Ranking: ${u.ranking ?? "—"}
Admission rate: ${u.admission_rate ?? "—"}%
Tuition: $${u.tuition_usd ?? "—"}/year
Full grant available: ${u.has_full_grant ? "yes" : "no"}
TOEFL min: ${u.toefl_min ?? "—"}, IELTS min: ${u.ielts_min ?? "—"}, SAT min: ${u.sat_min ?? "—"}, GPA min: ${u.gpa_min ?? "—"}
Description: ${u.description ?? ""}
Requirements: ${u.requirements ?? ""}
Values: ${u.values ?? ""}`;
      systemPrompt =
        lang === "ru"
          ? `Ты — дружелюбный AI-ментор по поступлению. Контекст об университете:\n${uniSummary}\n\nОтвечай коротко (до 6 предложений), по-русски, давай конкретные шаги как улучшить кейс (баллы, эссе, активности, рекомендации). ВСЕГДА в конце ответа добавляй короткое предупреждение: «⚠️ Это ответ искусственного интеллекта — для точных решений обратитесь к живому ментору или приёмной комиссии».`
          : `You are a friendly AI admissions mentor. University context:\n${uniSummary}\n\nAnswer concisely (≤6 sentences) with concrete steps to improve the case (scores, essays, activities, recommendations). ALWAYS end with a short disclaimer: "⚠️ This is AI-generated advice — for precise decisions, consult a real mentor or the admissions office."`;
    }

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...body.messages,
          ],
          stream: true,
        }),
      },
    );

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              lang === "ru"
                ? "Слишком много запросов. Попробуйте через минуту."
                : "Too many requests. Try again shortly.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              lang === "ru"
                ? "Закончились AI-кредиты. Пополните в Settings → Workspace → Usage."
                : "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-mentor error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
