"use client";
import { useState } from "react";
import { variables, type Prompt } from "@/data/library";
import { DRAFT_KEY, readDrafts } from "@/lib/drafts";
export default function DraftEditor({
  prompt,
  values,
  onChange,
  notify,
}: {
  prompt: Prompt;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  notify: (m: string) => void;
}) {
  const fields = variables(prompt.content);
  const complete = fields.filter((f) => values[f.key]?.trim()).length;
  const [saved, setSaved] = useState(false);

  return (
    <div className="variable-form">
      <div className="draft-heading">
        <h2>Completa tu contexto</h2>
        <span role="status">
          {complete} de {fields.length} campos
        </span>
      </div>
      <progress
        value={complete}
        max={fields.length}
        aria-label="Campos completados"
      />
      <p>
        Los campos vacíos conservan su marcador. Guardar un borrador es opcional
        y solo lo conserva en este navegador.
      </p>
      {fields.map((v, i) => (
        <label key={v.key} htmlFor={`field-${prompt.id}-${v.key}`}>
          {prompt.number === 15
            ? i === 0
              ? "Datos del prospecto"
              : "Datos de la propiedad"
            : v.label}
          <textarea
            id={`field-${prompt.id}-${v.key}`}
            maxLength={20000}
            value={values[v.key] || ""}
            placeholder="Escribe aquí…"
            onChange={(e) => {
              onChange({ ...values, [v.key]: e.target.value });
              setSaved(false);
            }}
          />
        </label>
      ))}
      <div className="draft-actions">
        <button
          onClick={() => {
            try {
              localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({ ...readDrafts(), [prompt.id]: values }),
              );
              setSaved(true);
              notify("Borrador guardado en este navegador.");
            } catch {
              notify(
                "No pudimos guardar el borrador. Copia tu versión para conservarla.",
              );
            }
          }}
        >
          {saved ? "Borrador guardado ✓" : "Guardar borrador"}
        </button>
        <span>
          {complete === fields.length
            ? "Listo para copiar tu versión personalizada."
            : `Faltan ${fields.length - complete} campos por completar.`}
        </span>
      </div>
    </div>
  );
}
