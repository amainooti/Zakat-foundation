"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations/blog";
import type { BlogPost } from "@/lib/types/app";
import { Loader2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

const CATEGORIES = ["News", "Stories", "Updates", "Reports", "Campaigns", "Community", "Other"];

interface Props { post?: BlogPost; }

function ToolbarBtn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode; }) {
  return (
    <button
      type="button" onClick={onClick} title={title}
      style={{ padding: "4px 8px", borderRadius: "5px", border: "none", background: active ? "#2A2A2A" : "transparent", color: active ? "#C9952A" : "#706B63", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
    >
      {children}
    </button>
  );
}

export default function BlogEditor({ post }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const isEdit   = !!post;
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: isEdit ? {
      title: post.title, slug: post.slug, excerpt: post.excerpt ?? "",
      content: post.content ?? "", cover_image: post.cover_image ?? "",
      category: post.category ?? "", tags: post.tags ?? [], published: post.published,
    } : { tags: [], published: false },
  });

  const tags = watch("tags") ?? [];

  const editor = useEditor({
    immediatelyRender: false, // ← important for performance, especially with many posts
    extensions: [
      StarterKit,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your post content here…" }),
      CharacterCount,
    ],
    content: isEdit ? (post.content ?? "") : "",
    onUpdate: ({ editor }) => setValue("content", editor.getHTML()),
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    register("title").onChange(e);
    if (!isEdit) setValue("slug", slugify(e.target.value));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setValue("tags", [...tags, t]);
    setTagInput("");
  }

  function removeTag(tag: string) { setValue("tags", tags.filter((t) => t !== tag)); }

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  async function onSubmit(data: BlogPostFormData) {
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const { error: err } = await supabase.from("blog_posts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", post.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("blog_posts").insert({ ...data });
        if (err) throw err;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const field: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "8px", background: "#1F1F1F", border: "1px solid #2A2A2A", color: "#F0EDE8", fontSize: "13px", fontFamily: "inherit", outline: "none" };
  const label: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 500, color: "#B8B3AC", marginBottom: "6px" };
  const err:   React.CSSProperties = { fontSize: "11px", color: "#E07A5A", marginTop: "4px" };
  const panel: React.CSSProperties = { background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "18px" };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <style>{`
        .tiptap-blog { outline: none; color: #B8B3AC; font-size: 14px; line-height: 1.75; min-height: 320px; }
        .tiptap-blog p { margin-bottom: 1em; }
        .tiptap-blog h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0EDE8; margin: 1.5em 0 0.5em; }
        .tiptap-blog h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #F0EDE8; margin: 1.25em 0 0.4em; }
        .tiptap-blog ul, .tiptap-blog ol { padding-left: 1.5em; margin-bottom: 1em; }
        .tiptap-blog li { margin-bottom: 0.3em; }
        .tiptap-blog blockquote { border-left: 3px solid #C9952A; padding-left: 1em; margin: 1.5em 0; color: #706B63; font-style: italic; }
        .tiptap-blog a { color: #C9952A; text-decoration: underline; }
        .tiptap-blog hr { border: none; border-top: 1px solid #2A2A2A; margin: 2em 0; }
        .tiptap-blog p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #4A4A44; pointer-events: none; float: left; height: 0; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Details */}
          <div style={panel}>
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "16px" }}>Post Details</h2>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Title *</label>
              <input {...register("title")} onChange={handleTitleChange} placeholder="Post title…" style={field} />
              {errors.title && <p style={err}>{errors.title.message}</p>}
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={label}>Slug *</label>
              <input {...register("slug")} style={{ ...field, fontFamily: "monospace", fontSize: "12px" }} />
              {errors.slug && <p style={err}>{errors.slug.message}</p>}
            </div>
            <div>
              <label style={label}>Excerpt <span style={{ color: "#706B63" }}>(shown in listing)</span></label>
              <textarea {...register("excerpt")} placeholder="Brief summary…" rows={3} style={{ ...field, resize: "vertical", lineHeight: 1.6 }} />
              {errors.excerpt && <p style={err}>{errors.excerpt.message}</p>}
            </div>
          </div>

          {/* Rich text editor */}
          <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #2A2A2A" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8" }}>Content</h2>
            </div>
            {editor && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", padding: "8px 12px", borderBottom: "1px solid #2A2A2A", background: "#1A1A1A" }}>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><strong>B</strong></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><em>I</em></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">H2</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">H3</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">1. List</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">❝</ToolbarBtn>
                <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Link">Link</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">Unlink</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">—</ToolbarBtn>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: "10px", color: "#4A4A44", alignSelf: "center", fontFamily: "monospace" }}>
                  {editor.storage.characterCount?.characters() ?? 0} chars
                </span>
              </div>
            )}
            <div style={{ padding: "16px 20px", minHeight: "360px" }}>
              <EditorContent editor={editor} className="tiptap-blog" />
            </div>
          </div>

          {/* Cover image */}
          <div style={panel}>
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "14px" }}>Cover Image</h2>
            <input {...register("cover_image")} placeholder="Paste image URL…" style={field} />
            {watch("cover_image") && (
              <img src={watch("cover_image")} alt="" style={{ marginTop: "12px", width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} />
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Save */}
          <div style={panel}>
            {error && <p style={{ ...err, marginBottom: "12px", padding: "10px 12px", background: "rgba(160,65,42,0.1)", borderRadius: "8px" }}>{error}</p>}
            <button type="submit" disabled={saving} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "8px", border: "none", background: saving ? "rgba(201,149,42,0.5)" : "#C9952A", color: "#0D0D0D", fontSize: "13px", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Post"}
            </button>
            <button type="button" onClick={() => router.back()} style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "8px", border: "1px solid #2A2A2A", background: "transparent", color: "#706B63", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>

          {/* Publish */}
          <div style={panel}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" {...register("published")} style={{ width: 16, height: 16, accentColor: "#C9952A" }} />
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#F0EDE8" }}>Published</p>
                <p style={{ fontSize: "11px", color: "#706B63" }}>Visible on public site</p>
              </div>
            </label>
          </div>

          {/* Category */}
          <div style={panel}>
            <label style={label}>Category</label>
            <select {...register("category")} style={{ ...field, cursor: "pointer" }}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div style={panel}>
            <label style={label}>Tags</label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} placeholder="Add tag…" style={{ ...field, flex: 1 }} />
              <button type="button" onClick={addTag} style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #2A2A2A", background: "#2A2A2A", color: "#B8B3AC", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>Add</button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "99px", background: "rgba(201,149,42,0.1)", border: "1px solid rgba(201,149,42,0.2)", color: "#C9952A", fontSize: "11px" }}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}