"use client";

import { useState, useRef, useCallback } from "react";

interface MediaFile {
  id?: string;
  name: string;
  folder: string;
  path: string;
  publicUrl: string;
  metadata?: { size?: number; mimetype?: string };
  created_at?: string;
}

const FOLDERS = ["", "campaigns", "blog", "site", "misc"] as const;
const FOLDER_LABELS: Record<string, string> = {
  "":         "Root",
  campaigns:  "Campaigns",
  blog:       "Blog",
  site:       "Site",
  misc:       "Misc",
};

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaClient({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [files,       setFiles]       = useState<MediaFile[]>(initialFiles);
  const [folder,      setFolder]      = useState<string>("");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<MediaFile | null>(null);
  const [copied,      setCopied]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [deleting,    setDeleting]    = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = files.filter((f) => {
    const matchFolder = folder === "" ? true : f.folder === folder;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  const uploadFile = useCallback(async (file: File, targetFolder: string) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

    if (!ALLOWED.includes(file.type)) {
      setError("Only images are allowed (JPEG, PNG, WebP, GIF, SVG).");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File exceeds the 10MB limit.");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadPct(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", targetFolder);

      setUploadPct(40);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      setUploadPct(80);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setFiles((prev) => [data.file, ...prev]);
      setUploadPct(100);
      setTimeout(() => { setUploading(false); setUploadPct(0); }, 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setUploadPct(0);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, folder || "misc");
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file, folder || "misc");
  };

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Delete "${selected.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selected.path }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setFiles((prev) => prev.filter((f) => f.path !== selected.path));
      setSelected(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

      {/* Left — browser */}
      <div>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search files…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", background: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F0EDE8", fontSize: "13px", outline: "none", width: "220px", fontFamily: "inherit" }}
          />

          {/* Folder pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {FOLDERS.map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                style={{
                  padding: "6px 14px", borderRadius: "6px",
                  border: `1px solid ${folder === f ? "#C9952A" : "#2A2A2A"}`,
                  background: folder === f ? "rgba(201,149,42,0.08)" : "transparent",
                  color: folder === f ? "#C9952A" : "#706B63",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {FOLDER_LABELS[f]}
              </button>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              marginLeft: "auto", padding: "8px 18px",
              background: "#C9952A", color: "#0D0D0D",
              border: "none", borderRadius: "8px",
              fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.06em", cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1, transition: "opacity 0.15s",
            }}
          >
            {uploading ? `Uploading… ${uploadPct}%` : "↑ Upload"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", background: "rgba(160,65,42,0.1)", border: "1px solid rgba(160,65,42,0.25)", color: "#E07A5A", fontSize: "12px" }}>
            {error}
          </div>
        )}

        {/* Upload progress bar */}
        {uploading && (
          <div style={{ height: "3px", background: "#1F1F1F", borderRadius: 99, overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ height: "100%", width: `${uploadPct}%`, background: "#C9952A", transition: "width 0.3s ease", borderRadius: 99 }} />
          </div>
        )}

        {/* Drop zone + grid */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "#C9952A" : "#1F1F1F"}`,
            borderRadius: "12px", padding: "16px",
            transition: "border-color 0.2s",
            minHeight: "200px",
          }}
        >
          {dragOver && (
            <div style={{ textAlign: "center", padding: "32px", color: "#C9952A", fontSize: "14px", fontWeight: 600 }}>
              Drop to upload
            </div>
          )}

          {!dragOver && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: "#4A4540" }}>
              <p style={{ fontSize: "13px", marginBottom: "8px" }}>No files here.</p>
              <p style={{ fontSize: "12px" }}>Drop an image or click Upload.</p>
            </div>
          )}

          {!dragOver && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
              {filtered.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setSelected(f.path === selected?.path ? null : f)}
                  style={{
                    background: f.path === selected?.path ? "rgba(201,149,42,0.1)" : "#161616",
                    border: `1px solid ${f.path === selected?.path ? "#C9952A" : "#1F1F1F"}`,
                    borderRadius: "8px", padding: "6px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ aspectRatio: "1", borderRadius: "4px", overflow: "hidden", background: "#0D0D0D", marginBottom: "6px" }}>
                    <img
                      src={f.publicUrl}
                      alt={f.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <p style={{ fontSize: "10px", color: "#706B63", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "10px" }}>
          {filtered.length} file{filtered.length !== 1 ? "s" : ""} · Drag and drop to upload · 10MB max · Images only
        </p>
      </div>

      {/* Right — detail panel */}
      <div style={{ position: "sticky", top: "24px" }}>
        {selected ? (
          <div style={{ background: "#161616", border: "1px solid #1F1F1F", borderRadius: "12px", overflow: "hidden" }}>
            {/* Preview */}
            <div style={{ aspectRatio: "1", background: "#0D0D0D", borderBottom: "1px solid #1F1F1F" }}>
              <img src={selected.publicUrl} alt={selected.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div style={{ padding: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "4px", wordBreak: "break-all" }}>
                {selected.name}
              </p>
              <p style={{ fontSize: "11px", color: "#4A4540", marginBottom: "12px" }}>
                {FOLDER_LABELS[selected.folder] ?? selected.folder} · {formatBytes(selected.metadata?.size)}
              </p>

              {/* URL copy */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input
                  readOnly
                  value={selected.publicUrl}
                  style={{
                    flex: 1, padding: "7px 10px", borderRadius: "6px",
                    background: "#0D0D0D", border: "1px solid #2A2A2A",
                    color: "#706B63", fontSize: "11px", outline: "none",
                    fontFamily: "'DM Mono', monospace", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                />
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "7px 12px", borderRadius: "6px",
                    background: copied ? "rgba(42,122,74,0.15)" : "rgba(201,149,42,0.1)",
                    border: `1px solid ${copied ? "rgba(42,122,74,0.3)" : "#7A5A1A"}`,
                    color: copied ? "#5DBF84" : "#C9952A",
                    fontSize: "11px", fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "Copied ✓" : "Copy URL"}
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  width: "100%", padding: "8px", borderRadius: "6px",
                  background: "transparent", border: "1px solid rgba(160,65,42,0.3)",
                  color: "#A0412A", fontSize: "12px", fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.5 : 1, transition: "all 0.15s",
                }}
              >
                {deleting ? "Deleting…" : "Delete File"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#161616", border: "1px solid #1F1F1F", borderRadius: "12px", padding: "32px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#4A4540", marginBottom: "6px" }}>No file selected</p>
            <p style={{ fontSize: "12px", color: "#2A2A2A" }}>Click a file to preview and copy its URL</p>
          </div>
        )}
      </div>
    </div>
  );
}