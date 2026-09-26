"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  Star,
  Copy,
  Check,
  CircleAlert,
  Download,
  Upload,
  SlidersHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import {
  prompts,
  categories,
  stages,
  variables,
  personalize,
  flows,
  type Prompt,
} from "@/data/library";
import { searchScore } from "@/lib/search";
import { PromptText } from "./PromptContent";
import CopyButton from "./CopyButton";
import PromptCard from "./PromptCard";
import FolderBrowser from "./FolderBrowser";
import DraftEditor from "./DraftEditor";
import useLibraryNavigation, { returnLocation } from "./useLibraryNavigation";
import { DRAFT_KEY, readDrafts, validDrafts } from "@/lib/drafts";
const STORE = "lq-library-v1";

export default function Library({ initialId }: { initialId?: string }) {
  const {
    view,
    query,
    setQuery,
    category,
    setCategory,
    stage,
    setStage,
    onlyFav,
    setOnlyFav,
    openFolder,
    setOpenFolder,
    navigate,
    remember,
  } = useLibraryNavigation(Boolean(initialId));
  const [favorites, setFavorites] = useState<number[]>([]),
    [recent, setRecent] = useState<number[]>([]),
    [ready, setReady] = useState(false),
    [toast, setToast] = useState(""),
    [prepare, setPrepare] = useState(false),
    [values, setValues] = useState<Record<string, string>>({}),
    [backUrl, setBackUrl] = useState("/");
  const fileRef = useRef<HTMLInputElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const canWritePreferences = useRef(true);
  const selected = prompts.find((p) => p.id === initialId);
  useEffect(() => {
    try {
      setValues(initialId ? readDrafts()[initialId] || {} : {});
    } catch {
      setValues({});
      setToast("No pudimos recuperar el borrador guardado.");
    }
    setPrepare(false);
    setBackUrl(
      returnLocation()?.url ||
        `/?folder=${selected ? categories.indexOf(selected.category) : 0}`,
    );
  }, [initialId]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (!Array.isArray(saved.favorites) || !Array.isArray(saved.recent))
          throw Error();
        setFavorites(
          saved.favorites.filter(
            (n: unknown) =>
              Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 30,
          ),
        );
        setRecent(
          saved.recent.filter(
            (n: unknown) =>
              Number.isInteger(n) && Number(n) >= 1 && Number(n) <= 30,
          ),
        );
      }
    } catch {
      canWritePreferences.current = false;
      setToast(
        "No pudimos recuperar tus preferencias locales. Puedes usar la biblioteca y exportar tus nuevas selecciones.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && canWritePreferences.current) {
      try {
        localStorage.setItem(
          STORE,
          JSON.stringify({ version: 1, favorites, recent }),
        );
      } catch {
        setToast(
          "El navegador no permite guardar preferencias. Exporta una copia para conservarlas.",
        );
      }
    }
  }, [favorites, recent, ready]);
  useEffect(() => {
    if (ready && selected)
      setRecent((old) =>
        [selected.number, ...old.filter((n) => n !== selected.number)].slice(
          0,
          8,
        ),
      );
  }, [ready, selected]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  function favorite(n: number) {
    setFavorites((old) =>
      old.includes(n) ? old.filter((x) => x !== n) : [...old, n],
    );
  }
  async function copy(p: Prompt, custom = false) {
    try {
      await navigator.clipboard.writeText(
        custom ? personalize(p.content, values) : p.content,
      );
      setToast(
        custom ? "Prompt personalizado copiado" : "Prompt original copiado",
      );
      setRecent((old) =>
        [p.number, ...old.filter((n) => n !== p.number)].slice(0, 8),
      );
      return true;
    } catch {
      setToast(
        "No se pudo copiar. Abre el prompt y selecciona el texto para copiarlo.",
      );
      return false;
    }
  }
  function backup() {
    try {
      const url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              {
                app: STORE,
                version: 2,
                favorites,
                recent,
                drafts: readDrafts(),
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "biblioteca-lq-respaldo.json";
      a.click();
      URL.revokeObjectURL(url);
      setToast("Copia exportada con favoritos, recientes y borradores.");
    } catch {
      setToast(
        "No pudimos exportar la copia. Comprueba el almacenamiento del navegador.",
      );
    }
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10000000) throw Error();
      const d = JSON.parse(await file.text());
      const valid = (a: unknown) =>
        Array.isArray(a) &&
        a.every((n) => Number.isInteger(n) && n >= 1 && n <= 30);
      if (
        d.app !== STORE ||
        ![1, 2].includes(d.version) ||
        !valid(d.favorites) ||
        !valid(d.recent) ||
        (d.version === 2 && !validDrafts(d.drafts))
      )
        throw Error();
      if (d.version === 2)
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ ...d.drafts, ...readDrafts() }),
        );
      canWritePreferences.current = true;
      setFavorites((old) => [...new Set([...old, ...d.favorites])]);
      setRecent((old) =>
        [...new Set<number>([...d.recent, ...old])].slice(0, 8),
      );
      setToast(
        "Copia importada. Se conservan tus favoritos y borradores actuales.",
      );
    } catch {
      setToast(
        "Archivo no válido. Selecciona una copia exportada desde esta biblioteca.",
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  }
  const results = prompts
    .filter(
      (p) =>
        searchScore(p, query) > 0 &&
        (!category || p.category === category) &&
        (!stage || p.tags.includes(stage)) &&
        (!onlyFav || favorites.includes(p.number)),
    )
    .sort((a, b) =>
      query.trim()
        ? searchScore(b, query) - searchScore(a, query) || a.number - b.number
        : a.number - b.number,
    );

  return (
    <div
      className={`app-shell ${selected ? "detail-shell tone-" + categories.indexOf(selected.category) : ""}`}
    >
      <a className="skip" href="#main">
        Ir al contenido
      </a>
      <header className="archive-header">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <BookOpen size={23} />
          </span>
          <span>
            LQ<span className="brand-sub">EL ARCHIVO INMOBILIARIO</span>
          </span>
        </Link>
        <nav aria-label="Navegación principal">
          {[
            "Inicio",
            "Todos los prompts",
            "Favoritos",
            "Flujo recomendado",
          ].map((v) => (
            <button
              key={v}
              aria-current={!selected && view === v ? "page" : undefined}
              className={
                !selected && view === v ? "nav-item active" : "nav-item"
              }
              onClick={() => {
                if (selected)
                  window.location.href = `/?view=${encodeURIComponent(v)}`;
                else navigate(v);
              }}
            >
              {v === "Inicio" ? "Carpetas" : v}
              {v === "Favoritos" && (
                <span className="nav-count">{favorites.length}</span>
              )}
            </button>
          ))}
        </nav>
        <span className="archive-edition">
          COLECCIÓN 01 <span>30 PROMPTS</span>
        </span>
      </header>
      <div className="workspace">
        <main
          id="main"
          onClickCapture={(e) => {
            if (
              !selected &&
              (e.target as HTMLElement).closest('a[href^="/prompt/"]')
            )
              remember();
          }}
        >
          {selected ? (
            <>
              <div className="detail-heading">
                <Link href={backUrl} className="back">
                  <ArrowLeft size={16} /> Volver a mi selección
                </Link>
                <span className="pill">
                  PROMPT {String(selected.number).padStart(2, "0")} / 30
                </span>
              </div>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">{selected.category}</div>
                  <h1>{selected.displayTitle}</h1>
                  <p>{selected.objective}</p>
                </div>
                <button
                  className="favorite-detail"
                  aria-pressed={favorites.includes(selected.number)}
                  onClick={() => favorite(selected.number)}
                >
                  <Star
                    size={18}
                    fill={
                      favorites.includes(selected.number)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {favorites.includes(selected.number)
                    ? "Guardado"
                    : "Guardar en favoritos"}
                </button>
              </div>
              <form action="/" className="detail-search">
                <Search size={18} />
                <input
                  aria-label="Buscar otro prompt"
                  name="q"
                  placeholder="Buscar otro prompt…"
                />
                <button type="submit">Buscar</button>
              </form>
              <div className="document-folder">
                <div className="document-tab">{selected.category}</div>
                <div className="detail-layout">
                  <section className="reading">
                    <div className="reading-toolbar">
                      <div className="tabs">
                        <button
                          aria-pressed={!prepare}
                          className={!prepare ? "selected" : ""}
                          onClick={() => setPrepare(false)}
                        >
                          Texto original
                        </button>
                        {variables(selected.content).length > 0 && (
                          <button
                            aria-pressed={prepare}
                            className={prepare ? "selected" : ""}
                            onClick={() => setPrepare(true)}
                          >
                            Preparar para usar
                          </button>
                        )}
                      </div>
                      <CopyButton
                        className="primary"
                        onCopy={() => copy(selected, prepare)}
                        label={
                          prepare ? "Copiar personalizado" : "Copiar prompt"
                        }
                      />
                    </div>
                    {prepare && (
                      <DraftEditor
                        key={selected.id}
                        prompt={selected}
                        values={values}
                        onChange={setValues}
                        notify={setToast}
                      />
                    )}
                    <h2 className="original-title">{selected.title}</h2>
                    <PromptText
                      content={
                        prepare
                          ? personalize(selected.content, values)
                          : selected.content
                      }
                    />
                  </section>
                  <aside className="detail-aside">
                    <div className="note-panel">
                      <div className="eyebrow">ANTES DE EMPEZAR</div>
                      <h2>Hazlo tuyo.</h2>
                      <p>
                        Lee el prompt, completa los campos destacados y cópialo
                        en tu herramienta de IA.
                      </p>
                      <div className="tags">
                        {selected.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href,
                            );
                            setToast("Enlace copiado");
                          } catch {
                            setToast(
                              "Copia el enlace desde la barra del navegador.",
                            );
                          }
                        }}
                      >
                        Copiar enlace <Copy size={15} />
                      </button>
                    </div>
                    <h3>Continúa tu recorrido</h3>
                    {[
                      ...new Set([
                        ...flows.flatMap((f) => {
                          const at = f.ids.indexOf(selected.number);
                          return at >= 0
                            ? selected.number === 9
                              ? [10, 11]
                              : f.ids.slice(at + 1, at + 2)
                            : [];
                        }),
                        ...selected.related,
                      ]),
                    ]
                      .filter((n) => n !== selected.number)
                      .slice(0, 3)
                      .map((n) => (
                        <Link className="related" href={`/prompt/${n}`} key={n}>
                          <span>{String(n).padStart(2, "0")}</span>
                          {prompts[n - 1].displayTitle}
                          <ArrowRight size={15} />
                        </Link>
                      ))}
                  </aside>
                </div>
              </div>
              <div className="prev-next">
                {selected.number > 1 ? (
                  <Link href={`/prompt/${selected.number - 1}`}>
                    <ArrowLeft size={16} /> Anterior
                  </Link>
                ) : (
                  <span />
                )}
                {selected.number < 30 && (
                  <Link href={`/prompt/${selected.number + 1}`}>
                    Siguiente <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    EL ARCHIVO / PROMPTS INMOBILIARIOS
                  </div>
                  <h1>
                    {view === "Inicio" ? "Tu biblioteca, en carpetas." : view}
                  </h1>
                  <p>
                    {view === "Inicio"
                      ? "Abre una carpeta. Encuentra las palabras. Hazlas tuyas."
                      : view === "Todos los prompts"
                        ? "Los 30 originales, listos para consultar y copiar."
                        : view === "Favoritos"
                          ? "Tus prompts esenciales, siempre a mano."
                          : view === "Flujo recomendado"
                            ? "Un recorrido simple para pasar del contenido a la conversación."
                            : "Encuentra el siguiente paso para acompañar a tus clientes."}
                  </p>
                </div>
                <span className="collection-count">
                  <BookOpen size={19} />
                  <strong>30</strong> prompts originales
                </span>
              </div>
              <div className="search-bar">
                <div className="search-input">
                  <Search size={20} />
                  <input
                    maxLength={300}
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca un tema, número o tarea…"
                    aria-label="Buscar prompts"
                  />
                  {query && (
                    <button
                      aria-label="Borrar búsqueda"
                      className="icon-button"
                      onClick={() => setQuery("")}
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>
                <select
                  aria-label="Categoría"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="filters">
                <label className={"favorite-filter " + (onlyFav ? "on" : "")}>
                  <input
                    type="checkbox"
                    checked={onlyFav}
                    onChange={(e) => setOnlyFav(e.target.checked)}
                  />
                  <Star size={15} /> Solo favoritos
                </label>
                <label className="stage-filter">
                  <SlidersHorizontal size={15} />
                  <select
                    value={stage}
                    aria-label="Etapa del proceso"
                    onChange={(e) => setStage(e.target.value)}
                  >
                    <option value="">Todas las etapas</option>
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="backup-actions">
                  <button onClick={backup}>
                    <Download size={14} />
                    Exportar copia
                  </button>
                  <button onClick={() => fileRef.current?.click()}>
                    <Upload size={14} />
                    Importar copia
                  </button>
                </div>
                <input
                  hidden
                  type="file"
                  accept="application/json,.json"
                  ref={fileRef}
                  onChange={(e) => restore(e.target.files?.[0])}
                />
              </div>
              {(query || category || stage || onlyFav) && (
                <div className="active-filters" aria-label="Filtros activos">
                  {query && (
                    <button onClick={() => setQuery("")}>
                      Búsqueda: {query}
                      <X size={14} />
                    </button>
                  )}
                  {category && (
                    <button onClick={() => setCategory("")}>
                      {category}
                      <X size={14} />
                    </button>
                  )}
                  {stage && (
                    <button onClick={() => setStage("")}>
                      {stage}
                      <X size={14} />
                    </button>
                  )}
                  {onlyFav && (
                    <button onClick={() => setOnlyFav(false)}>
                      Solo favoritos
                      <X size={14} />
                    </button>
                  )}
                  <button
                    className="clear-filters"
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                      setStage("");
                      setOnlyFav(view === "Favoritos");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
              {view === "Flujo recomendado" &&
              !query &&
              !category &&
              !stage &&
              !onlyFav ? (
                <>
                  <div className="process">
                    {[
                      "Contenido",
                      "Conversación",
                      "Calificación",
                      "Seguimiento",
                      "Cita",
                      "Visita",
                      "Cierre",
                    ].map((s, i) => (
                      <span key={s}>
                        {s}
                        {i < 6 && <ChevronRight size={14} />}
                      </span>
                    ))}
                  </div>
                  <div className="flow-grid">
                    {flows.map((f, i) => (
                      <article className="flow-card" key={f.title}>
                        <span className="flow-index">0{i + 1}</span>
                        <h2>{f.title}</h2>
                        <p>{f.description}</p>
                        <div>
                          {f.ids.map((n, j) => (
                            <span key={n}>
                              <Link href={`/prompt/${n}`}>
                                <span>{n}</span>
                                {prompts[n - 1].displayTitle}
                                <ArrowRight size={14} />
                              </Link>
                              {f.title === "Cuando llega un mensaje" &&
                                j === 1 && (
                                  <small className="or">
                                    o, si es propietario
                                  </small>
                                )}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {!query &&
                  !category &&
                  !stage &&
                  !onlyFav &&
                  view === "Inicio" ? (
                    <FolderBrowser
                      openFolder={openFolder}
                      setOpenFolder={setOpenFolder}
                      favorites={favorites}
                      favorite={favorite}
                      copy={copy}
                      recent={recent}
                    />
                  ) : (
                    <>
                      <div className="results-heading">
                        <h2>
                          {onlyFav
                            ? "Tus favoritos"
                            : category || "Explora la biblioteca"}{" "}
                          <span aria-live="polite">
                            {results.length}{" "}
                            {results.length === 1 ? "prompt" : "prompts"}
                          </span>
                        </h2>
                        <span className="order-label">
                          {query.trim()
                            ? "Más relevantes primero"
                            : "En el orden de tu sistema"}{" "}
                          <ArrowRight size={13} />
                        </span>
                      </div>
                      {results.length ? (
                        <div className="cards">
                          {results.map((p) => (
                            <PromptCard
                              key={p.id}
                              p={p}
                              query={query}
                              favorites={favorites}
                              favorite={favorite}
                              copy={copy}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="empty">
                          <Search size={30} />
                          <h2>
                            {onlyFav && !query
                              ? "Aún no hay favoritos en esta selección"
                              : "No encontramos coincidencias"}
                          </h2>
                          <p>
                            {onlyFav && !query
                              ? "Guarda tus prompts con la estrella para encontrarlos aquí."
                              : "Prueba otra palabra o elimina algún filtro."}
                          </p>
                          <button
                            onClick={() => {
                              navigate("Todos los prompts");
                            }}
                          >
                            Ver todos los prompts
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
          <footer>
            <span>
              <BookOpen size={14} /> Biblioteca de Prompts Inmobiliarios
            </span>
            <span>30 prompts · Un sistema de conexiones reales</span>
          </footer>
        </main>
      </div>
      <div
        className={"toast " + (toast ? "visible" : "")}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            {/^(No |Archivo |El navegador)/.test(toast) ? (
              <CircleAlert size={18} />
            ) : (
              <Check size={18} />
            )}
            <span>{toast}</span>
            <button onClick={() => setToast("")} aria-label="Cerrar mensaje">
              <X size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
