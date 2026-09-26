import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { categories, type Prompt } from "@/data/library";
import { normalize } from "@/lib/search";
import { Highlight } from "./PromptContent";
import CopyButton from "./CopyButton";
export default function PromptCard({
  p,
  query,
  favorites,
  favorite,
  copy,
}: {
  p: Prompt;
  query: string;
  favorites: number[];
  favorite: (n: number) => void;
  copy: (p: Prompt) => Promise<boolean>;
}) {
  let preview = p.content.slice(0, 230);
  if (query.trim()) {
    const idx = normalize(p.content).indexOf(
      normalize(query)
        .split(/\s+/)
        .find((t) => t.length > 2) || normalize(query),
    );
    if (idx > 120)
      preview = "…" + p.content.slice(Math.max(0, idx - 50), idx + 180);
  }
  return (
    <article
      className={`card color-${categories.indexOf(p.category)}`}
      key={p.number}
    >
      <div className="card-top">
        <span>{p.category}</span>
        <button
          className={
            "icon-button star " + (favorites.includes(p.number) ? "saved" : "")
          }
          aria-label={`${favorites.includes(p.number) ? "Quitar de" : "Guardar en"} favoritos: ${p.displayTitle}`}
          aria-pressed={favorites.includes(p.number)}
          onClick={() => favorite(p.number)}
        >
          <Star
            size={18}
            fill={favorites.includes(p.number) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <Link href={`/prompt/${p.id}`} className="card-title">
        <span className="number">{String(p.number).padStart(2, "0")}</span>
        <h3>
          <Highlight text={p.displayTitle} query={query} />
        </h3>
      </Link>
      <p className="objective">
        <Highlight text={p.objective} query={query} />
      </p>
      <div className="preview">
        <Highlight text={preview} query={query} />
        <span>…</span>
      </div>
      <div className="tags">
        {p.tags.slice(0, 3).map((t) => (
          <span key={t}>
            <Highlight text={t} query={query} />
          </span>
        ))}
      </div>
      <div className="card-actions">
        <CopyButton onCopy={() => copy(p)} />
        <Link href={`/prompt/${p.id}`}>
          Abrir prompt <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
