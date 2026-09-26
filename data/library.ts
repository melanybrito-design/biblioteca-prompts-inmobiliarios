import records from "./prompts.json";
export type Prompt = (typeof records)[number];
export const prompts: Prompt[] = records;
export const categories = [
  "Marca y estrategia",
  "Contenido y publicaciones",
  "Conversaciones y prospectos",
  "Visitas y trabajo diario",
  "Avatar e imágenes",
  "Embudo y dirección IA",
];
export const stages = [
  "atracción",
  "interacción",
  "calificación",
  "seguimiento",
  "cita",
  "visita",
  "negociación",
  "cierre",
  "referidos",
];
export { normalize } from "../lib/search";
export { variables, personalize } from "../lib/template";
export const flows = [
  {
    title: "Por la mañana",
    description: "Define las prioridades y tu siguiente acción.",
    ids: [30],
  },
  {
    title: "Para crear contenido",
    description: "De la idea al Reel, el gancho y la conversación.",
    ids: [2, 3, 4, 8],
  },
  {
    title: "Cuando llega un mensaje",
    description: "Responde y califica al comprador o al propietario.",
    ids: [9, 10, 11],
  },
  {
    title: "Después de conversar",
    description: "Clasifica la intención y prepara el seguimiento.",
    ids: [12, 13],
  },
  {
    title: "Antes de una visita",
    description: "Llega con preguntas y argumentos relevantes.",
    ids: [15],
  },
  {
    title: "Cada semana",
    description: "Analiza resultados y organiza tus publicaciones.",
    ids: [18, 19],
  },
];
