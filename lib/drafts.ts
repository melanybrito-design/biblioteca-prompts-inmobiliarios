export const DRAFT_KEY = "lq-drafts-v1";
export type Drafts = Record<string, Record<string, string>>;
export function validDrafts(value: unknown): value is Drafts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(
    ([id, fields]) =>
      /^([1-9]|[12]\d|30)$/.test(id) &&
      fields &&
      typeof fields === "object" &&
      !Array.isArray(fields) &&
      Object.entries(fields).every(
        ([key, v]) =>
          /^\d{1,3}$/.test(key) && typeof v === "string" && v.length <= 20000,
      ),
  );
}
export function readDrafts(): Drafts {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return {};
  const d: unknown = JSON.parse(raw);
  if (!validDrafts(d)) throw Error("Borradores no válidos");
  return d;
}
