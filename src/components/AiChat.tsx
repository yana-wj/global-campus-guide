import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  mode: "mentor" | "search";
  university?: Record<string, unknown>;
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
  placeholder?: string;
  intro?: ReactNode;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`;

export function AiChat({ mode, university, catalog, placeholder, intro }: Props) {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, university, catalog, lang, mode }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast.error(err.error || (lang === "ru" ? "Ошибка AI" : "AI error"));
        setMessages(messages); // revert
        setLoading(false);
        return;
      }
      if (!resp.body) throw new Error("No stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              acc += chunk;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, idx) => (idx === prev.length - 1 ? { ...m, content: acc } : m));
                }
                return [...prev, { role: "assistant", content: acc }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(e);
        toast.error(lang === "ru" ? "Не удалось связаться с AI" : "Failed to reach AI");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  // Render assistant text with [slug] → links to university details
  const renderAssistant = (content: string) => {
    if (mode !== "search") return content;
    const parts = content.split(/(\[[a-z0-9-]+\])/gi);
    return parts.map((p, i) => {
      const m = p.match(/^\[([a-z0-9-]+)\]$/i);
      if (m) {
        return (
          <Link
            key={i}
            to="/universities/$slug"
            params={{ slug: m[1] }}
            className="font-semibold text-primary hover:underline"
          >
            {m[1]}
          </Link>
        );
      }
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">
            {mode === "mentor"
              ? lang === "ru"
                ? "AI-ментор по этому вузу"
                : "AI mentor for this university"
              : lang === "ru"
                ? "AI-подбор университета"
                : "AI university matcher"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {mode === "mentor"
              ? lang === "ru"
                ? "Спросите как улучшить кейс под этот университет"
                : "Ask how to strengthen your case for this school"
              : lang === "ru"
                ? "Опишите свой профиль — AI подберёт подходящие вузы"
                : "Describe your profile — AI will suggest matches"}
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-start gap-2 rounded-lg border border-sun/40 bg-sun/10 p-3 text-xs text-foreground/80">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-sun-foreground" />
        <p>{t("ai_disclaimer")}</p>
      </div>

      {intro && messages.length === 0 && (
        <div className="mb-3 text-sm text-muted-foreground">{intro}</div>
      )}

      {messages.length > 0 && (
        <div className="mb-3 max-h-96 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-6 bg-primary/10 text-foreground"
                  : "mr-6 border border-border bg-muted/30 whitespace-pre-wrap"
              }`}
            >
              {m.role === "assistant" ? renderAssistant(m.content) : m.content}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          rows={2}
          placeholder={
            placeholder ??
            (mode === "mentor"
              ? lang === "ru"
                ? "Например: у меня TOEFL 95 и GPA 3.7, как повысить шансы?"
                : "E.g. I have TOEFL 95 and GPA 3.7, how do I improve my chances?"
              : lang === "ru"
                ? "Например: люблю CS, бюджет $30k/год, нужны гранты, готов поехать в Европу"
                : "E.g. I love CS, $30k/yr budget, need grants, open to Europe")
          }
          className="flex-1 resize-none"
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="sm:self-end">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {lang === "ru" ? "Спросить" : "Ask"}
        </Button>
      </div>
    </div>
  );
}
