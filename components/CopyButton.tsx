"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
export default function CopyButton({
  onCopy,
  label = "Copiar",
  className = "",
  ariaLabel,
}: {
  onCopy: () => Promise<boolean>;
  label?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <button
      className={className}
      aria-label={copied ? "Copiado" : ariaLabel}
      onClick={async () => {
        if (await onCopy()) {
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2200);
        }
      }}
    >
      {copied ? <Check size={17} /> : <Copy size={17} />}
      <span aria-live="polite">{copied ? "Copiado ✓" : label}</span>
    </button>
  );
}
