import Link from "next/link";
import { ArrowLeft, ArrowRight, X, Star, Clock } from "lucide-react";
import { categories, prompts, type Prompt } from "@/data/library";
import CopyButton from "./CopyButton";
const folderNotes = [
  "La identidad detrás de cada mensaje.",
  "Ideas que se convierten en conversaciones.",
  "Respuestas humanas. Conexiones reales.",
  "Tu próxima acción, bien preparada.",
  "Una identidad visual que te representa.",
  "De una idea a todo un sistema.",
];
export default function FolderBrowser({
  openFolder,
  setOpenFolder,
  favorites,
  favorite,
  copy,
  recent,
}: {
  openFolder: number | null;
  setOpenFolder: (n: number | null) => void;
  favorites: number[];
  favorite: (n: number) => void;
  copy: (p: Prompt) => Promise<boolean>;
  recent: number[];
}) {
  return (
    <>
      <div className="archive-caption">
        <span>ÍNDICE DE LA COLECCIÓN</span>
        <span>
          06 carpetas / 30 originales <ArrowLeft size={14} />
        </span>
      </div>
      <section className="folder-stack" aria-label="Carpetas de prompts">
        {categories.map((c, i) => {
          const isOpen = openFolder === i;
          const entries = prompts.filter((p) => p.category === c);
          return (
            <section
              key={c}
              className={`folder tone-${i} ${isOpen ? "is-open" : ""}`}
            >
              <h2 className="folder-title">
                <button
                  className="folder-trigger"
                  aria-expanded={isOpen}
                  aria-controls={`folder-${i}`}
                  onClick={() => setOpenFolder(isOpen ? null : i)}
                >
                  <span className="folder-tab">{c}</span>
                  <span className="folder-cover">
                    <span className="folder-serial">ARCHIVO / 0{i + 1}</span>
                    <span className="folder-description">{folderNotes[i]}</span>
                    <span className="folder-count">
                      {String(entries.length).padStart(2, "0")}{" "}
                      {entries.length === 1 ? "prompt" : "prompts"}{" "}
                      <span className="folder-toggle">
                        {isOpen ? <X size={22} /> : <ArrowRight size={24} />}
                      </span>
                    </span>
                  </span>
                </button>
              </h2>
              <div
                className="folder-content"
                id={`folder-${i}`}
                hidden={!isOpen}
              >
                <div className="folder-paper">
                  <div className="paper-caption">
                    <span>CONTENIDO DE LA CARPETA</span>
                    <span>SELECCIONA UN PROMPT PARA LEERLO</span>
                  </div>
                  {entries.map((p) => (
                    <article className="file-row" key={p.number}>
                      <Link href={`/prompt/${p.id}`} className="file-link">
                        <span className="file-number">
                          {String(p.number).padStart(2, "0")}
                        </span>
                        <span>
                          <h3>{p.displayTitle}</h3>
                          <p>{p.objective}</p>
                        </span>
                        <ArrowRight size={21} />
                      </Link>
                      <CopyButton
                        className="file-copy"
                        ariaLabel={`Copiar prompt ${p.number}`}
                        onCopy={() => copy(p)}
                      />
                      <button
                        className="icon-button star"
                        aria-label={`${favorites.includes(p.number) ? "Quitar de" : "Guardar en"} favoritos: ${p.displayTitle}`}
                        aria-pressed={favorites.includes(p.number)}
                        onClick={() => favorite(p.number)}
                      >
                        <Star
                          size={18}
                          fill={
                            favorites.includes(p.number)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </section>
      <div className="archive-after">
        <Link href="/prompt/30">
          ¿Por dónde empezar?{" "}
          <span>
            Abre tu Directora IA <ArrowRight size={17} />
          </span>
        </Link>
        {recent.length > 0 && (
          <section className="recent">
            <h2>
              <Clock size={16} /> Abiertos recientemente
            </h2>
            <div>
              {recent.slice(0, 4).map((n) => (
                <Link key={n} href={`/prompt/${n}`}>
                  <span>{String(n).padStart(2, "0")}</span>
                  {prompts[n - 1].displayTitle}
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
