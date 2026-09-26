import { normalize } from "@/lib/search";
export function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return <>{text}</>;
  const normalized = normalize(text);
  const spans: boolean[] = Array(text.length).fill(false);
  tokens.forEach((t) => {
    let at = normalized.indexOf(t);
    while (at !== -1) {
      for (let i = at; i < at + t.length; i++) spans[i] = true;
      at = normalized.indexOf(t, at + Math.max(t.length, 1));
    }
  });
  const out: React.ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || spans[i] !== spans[start]) {
      out.push(
        spans[start] ? (
          <mark key={start}>{text.slice(start, i)}</mark>
        ) : (
          text.slice(start, i)
        ),
      );
      start = i;
    }
  }
  return <>{out}</>;
}
export function PromptText({ content }: { content: string }) {
  return (
    <div className="prompt-text">
      {content.split("\n").map((line, i) => (
        <p
          key={i}
          className={
            line.trim() === ""
              ? "blank"
              : /^[A-ZÁÉÍÓÚÑ\s /+]+:$/.test(line)
                ? "text-heading"
                : ""
          }
        >
          {line.split(/(\[[^\]]*\])/g).map((part, j) =>
            part.startsWith("[") ? (
              <mark className="variable" key={j}>
                {part}
              </mark>
            ) : (
              part
            ),
          ) || " "}
        </p>
      ))}
    </div>
  );
}
