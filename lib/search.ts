export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const ignored = new Set([
  "a",
  "al",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "de",
  "del",
  "para",
  "por",
  "con",
  "que",
  "y",
  "mi",
]);
export const searchTerms = (q: string) =>
  normalize(q)
    .split(/\s+/)
    .filter((t) => t && !ignored.has(t));
type Searchable = {
  number: number;
  title: string;
  displayTitle: string;
  category: string;
  objective: string;
  content: string;
  aliases: string;
  tags: string[];
};
const synonyms: Record<number, string> = {
  3: "video videos guion grabar reel",
  6: "anuncio anunciar publicar casa departamento inmueble propiedad",
  9: "responder contestar respuesta lead prospecto mensaje whatsapp cliente nuevo",
  13: "seguimiento contactar recordar lead prospecto whatsapp",
  14: "reactivar recuperar cliente desaparecio no responde",
  15: "preparar visita inmueble casa comprador",
  16: "objeciones dudas precio caro comision negociar",
  17: "organizar agenda tareas crm contactos prioridad",
  18: "metricas resultados analisis semanal",
  19: "plan semanal planificar organizar calendario semana publicaciones",
  22: "testimonio resena recomendacion referido",
  23: "avatar foto retrato imagen ia",
  29: "embudo funnel marketing ventas",
  30: "directora asistente ia prioridades dia",
};
export function searchScore(p: Searchable, query: string) {
  const terms = searchTerms(query);
  if (!terms.length) return 1;
  if (/^#?\d+$/.test(query.trim()))
    return p.number === Number(query.trim().replace("#", "")) ? 1000 : 0;
  const title = normalize(p.title + " " + p.displayTitle);
  const meta = normalize(
    [
      p.category,
      p.objective,
      p.aliases,
      ...p.tags,
      synonyms[p.number] || "",
    ].join(" "),
  );
  const body = normalize(p.content);
  if (
    !terms.every(
      (t) => title.includes(t) || meta.includes(t) || body.includes(t),
    )
  )
    return 0;
  return (
    terms.reduce(
      (score, t) =>
        score + (title.includes(t) ? 30 : meta.includes(t) ? 12 : 1),
      0,
    ) + (title.includes(normalize(query)) ? 50 : 0) + ((synonyms[p.number] || "").includes(normalize(query).trim()) ? 35 : 0)
  );
}
