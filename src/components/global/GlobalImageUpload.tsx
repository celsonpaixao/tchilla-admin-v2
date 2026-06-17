"use client";
import { useRef, useState, useCallback } from "react";
import NextImage from "next/image";
import { ImagePlus, X, Upload } from "lucide-react";

interface GlobalImageUploadProps {
  label?: string;
  optional?: boolean;
  value?: string | null;
  onChange: (file: File | null) => void;
  hint?: string;
}

export function GlobalImageUpload({ label, optional, value, onChange, hint }: GlobalImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const current = preview ?? value ?? null;

  function handleFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--text)",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          {label}
          {optional && (
            <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 11.5 }}>
              opcional
            </span>
          )}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {current ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 140,
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            border: "1px solid var(--border-strong)",
            cursor: "pointer",
          }}
          onClick={() => inputRef.current?.click()}
        >
          <NextImage
            src={current}
            alt="Preview"
            fill
            className="object-cover"
            sizes="400px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Upload size={14} /> Alterar foto
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remover foto"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.55)",
              border: "none",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            width: "100%",
            height: 120,
            borderRadius: "var(--r-md)",
            border: `2px dashed ${dragging ? "var(--blue)" : "var(--border-strong)"}`,
            background: dragging ? "var(--blue-50)" : "var(--gray-25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            transition: "border-color .15s, background .15s",
            color: "var(--text-3)",
          }}
          onMouseEnter={(e) => {
            if (!dragging) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)";
              (e.currentTarget as HTMLElement).style.background = "var(--blue-50)";
            }
          }}
          onMouseLeave={(e) => {
            if (!dragging) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              (e.currentTarget as HTMLElement).style.background = "var(--gray-25)";
            }
          }}
        >
          <ImagePlus size={22} style={{ color: dragging ? "var(--blue)" : "var(--text-3)" }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            Clique ou arraste uma imagem
          </span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            PNG, JPG, WEBP — máx. 5 MB
          </span>
        </button>
      )}

      {hint && (
        <p style={{ fontSize: 11.5, color: "var(--text-3)" }}>{hint}</p>
      )}
    </div>
  );
}
