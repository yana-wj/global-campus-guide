// Convert classic TOEFL iBT score (0–120) to the new 6.0 scale (0.0–6.0)
// rolled out by ETS in 2026. Mapping is based on the official ETS conversion
// table (rounded to one decimal). Returns null if input is null/undefined.
export function toeflTo6(score: number | null | undefined): number | null {
  if (score == null || isNaN(score)) return null;
  const s = Math.max(0, Math.min(120, score));
  // Linear-ish mapping calibrated to ETS bands:
  // 120 -> 6.0, 110 -> 5.5, 100 -> 5.0, 90 -> 4.5, 80 -> 4.0,
  //  70 -> 3.5,  60 -> 3.0,  50 -> 2.5, 40 -> 2.0, 30 -> 1.5,
  //  20 -> 1.0,  10 -> 0.5,   0 -> 0.0
  const v = (s / 120) * 6;
  return Math.round(v * 2) / 2;
}

export function formatToefl(score: number | null | undefined, lang: "ru" | "en"): string {
  if (score == null) return "—";
  const newScore = toeflTo6(score);
  return lang === "ru"
    ? `${newScore?.toFixed(1)} (нов. шкала)`
    : `${newScore?.toFixed(1)} (new scale)`;
}
