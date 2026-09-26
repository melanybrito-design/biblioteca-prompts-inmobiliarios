export function variables(content: string) {
  return [...content.matchAll(/\[([^\]]*)\]/g)].map((m, i) => ({
    key: String(i),
    token: m[0],
    label:
      m[1].trim() ||
      content.slice(0, m.index).trim().split("\n").at(-1)?.replace(/:$/, "") ||
      `Campo ${i + 1}`,
  }));
}
export function personalize(content: string, values: Record<string, string>) {
  let i = 0;
  return content.replace(
    /\[[^\]]*\]/g,
    (token) => values[String(i++)]?.trim() || token,
  );
}
