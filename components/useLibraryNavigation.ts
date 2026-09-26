"use client";
import { useEffect, useRef, useState } from "react";
import { categories, stages } from "@/data/library";
export const RETURN_KEY = "lq-library-return";
const views = [
  "Inicio",
  "Todos los prompts",
  "Favoritos",
  "Flujo recomendado",
  ...categories,
];
export function returnLocation() {
  try {
    const s = JSON.parse(sessionStorage.getItem(RETURN_KEY) || "null");
    if (
      s &&
      typeof s.url === "string" &&
      (s.url === "/" || s.url.startsWith("/?")) &&
      Number.isFinite(s.y)
    )
      return s;
  } catch {}
  return null;
}
export default function useLibraryNavigation(detail: boolean) {
  const [view, setView] = useState("Inicio"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [stage, setStage] = useState(""),
    [onlyFav, setOnlyFav] = useState(false),
    [openFolder, setOpenFolder] = useState<number | null>(null),
    [loaded, setLoaded] = useState(false);
  const restoring = useRef(false);
  useEffect(() => {
    if (detail) return;
    let timer: ReturnType<typeof setTimeout>;
    function read() {
      restoring.current = true;
      const p = new URLSearchParams(location.search);
      const v = p.get("view") || "Inicio";
      setView(views.includes(v) ? v : "Inicio");
      setQuery((p.get("q") || "").slice(0, 300));
      setCategory(
        categories.includes(p.get("category") || "")
          ? p.get("category")!
          : categories.includes(v)
            ? v
            : "",
      );
      setStage(stages.includes(p.get("stage") || "") ? p.get("stage")! : "");
      setOnlyFav(p.get("fav") === "1" || v === "Favoritos");
      const f = Number(p.get("folder"));
      setOpenFolder(
        p.has("folder") && Number.isInteger(f) && f >= 0 && f < 6 ? f : null,
      );
      setLoaded(true);
      const back = returnLocation();
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (back && back.url === location.pathname + location.search)
          window.scrollTo(0, back.y);
        else if (p.has("folder"))
          document
            .getElementById(`folder-${f}`)
            ?.closest(".folder")
            ?.scrollIntoView({ block: "start" });
      }, 200);
    }
    read();
    window.addEventListener("popstate", read);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", read);
    };
  }, [detail]);
  useEffect(() => {
    if (!loaded || detail) return;
    if (restoring.current) {
      restoring.current = false;
      return;
    }
    const p = new URLSearchParams();
    if (view !== "Inicio") p.set("view", view);
    if (query) p.set("q", query);
    if (category) p.set("category", category);
    if (stage) p.set("stage", stage);
    if (onlyFav) p.set("fav", "1");
    if (openFolder !== null) p.set("folder", String(openFolder));
    const url = "/" + (p.size ? "?" + p : "");
    if (location.pathname + location.search !== url)
      history.replaceState(history.state, "", url);
  }, [view, query, category, stage, onlyFav, openFolder, loaded, detail]);
  function navigate(v: string) {
    setView(v);
    setQuery("");
    setCategory(categories.includes(v) ? v : "");
    setStage("");
    setOnlyFav(v === "Favoritos");
    setOpenFolder(null);
  }
  function remember() {
    try {
      sessionStorage.setItem(
        RETURN_KEY,
        JSON.stringify({
          url: location.pathname + location.search,
          y: window.scrollY,
        }),
      );
    } catch {}
  }
  return {
    view,
    query,
    setQuery,
    category,
    setCategory,
    stage,
    setStage,
    onlyFav,
    setOnlyFav: (value: boolean) => {
      setOnlyFav(value);
      if (view === "Favoritos" && !value) setView("Todos los prompts");
    },
    openFolder,
    setOpenFolder,
    navigate,
    remember,
  };
}
