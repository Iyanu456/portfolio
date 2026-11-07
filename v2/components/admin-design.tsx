"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, GripVertical, ImagePlus, LoaderCircle, Pencil, Plus, Save, Star, Trash2, Upload, X } from "lucide-react";

type Project = {
  id: string; title: string; slug: string; category: string; categories?: string[]; year: string;
  summary: string; description: string; coverImage: string; gallery: string[];
  tags: string[]; featured: boolean; status: "DRAFT" | "PUBLISHED"; sortOrder: number;
  updatedAt?: string;
};
type FormProject = Omit<Project, "id" | "updatedAt">;
const empty: FormProject = {
  title: "", slug: "", category: "Branding", categories: ["Branding"], year: String(new Date().getFullYear()),
  summary: "", description: "", coverImage: "", gallery: [], tags: [],
  featured: false, status: "DRAFT", sortOrder: 0
};
const categoryOptions = ["Branding", "Social media campaigns", "Organizations", "Editorial", "Digital design", "Packaging", "Others"];

function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminDesign() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormProject>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/design", { cache: "no-store" });
      if (response.status === 401) { router.replace("/admin/login"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load projects.");
      setProjects(data);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load design projects.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const published = useMemo(() => projects.filter((project) => project.status === "PUBLISHED").length, [projects]);
  const drafts = projects.length - published;

  function startNew() {
    setForm({ ...empty, year: String(new Date().getFullYear()) });
    setEditingId(null); setSlugTouched(false); setTagInput(""); setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function edit(project: Project) {
    const { id, updatedAt, ...data } = project;
    setForm({ ...empty, ...data, categories: data.categories?.length ? data.categories : [data.category || "Others"], gallery: data.gallery || [], tags: data.tags || [] });
    setEditingId(id); setSlugTouched(true); setTagInput(""); setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setField<K extends keyof FormProject>(key: K, value: FormProject[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function upload(file: File, target: "cover" | "gallery") {
    if (!file.type.startsWith("image/")) throw new Error(`“${file.name}” is not an image file.`);
    const body = new FormData(); body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Could not upload ${file.name}.`);
    if (target === "cover") setForm((current) => ({ ...current, coverImage: data.url }));
    else setForm((current) => ({ ...current, gallery: [...current.gallery, data.url] }));
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>, target: "cover" | "gallery") {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (target === "gallery" && form.gallery.length + files.length > 20) {
      setError("A project can contain up to 20 additional images.");
      return;
    }
    setUploading(true); setError(""); setNotice("");
    try {
      for (const file of files) await upload(file, target);
      setNotice(files.length === 1 ? "Image uploaded to your media library." : `${files.length} images uploaded. Drag them to arrange the order.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally { setUploading(false); }
  }

  function moveGalleryImage(from: number, to: number) {
    if (to < 0 || to >= form.gallery.length || from === to) return;
    const next = [...form.gallery];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setField("gallery", next);
  }

  async function persistProjectOrder(nextProjects: Project[]) {
    setProjects(nextProjects);
    setReordering(true);
    try {
      const response = await fetch("/api/admin/design", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: nextProjects.map((project, index) => ({ id: project.id, sortOrder: index })) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save project order.");
      setNotice("Project order saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project order.");
      await load();
    } finally { setReordering(false); setDraggedProjectId(null); }
  }

  function moveProject(fromId: string, toId?: string) {
    if (!toId || fromId === toId) return;
    const from = projects.findIndex((project) => project.id === fromId);
    const to = projects.findIndex((project) => project.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    void persistProjectOrder(next);
  }

  function addTag(event?: FormEvent) {
    event?.preventDefault();
    const tag = tagInput.trim().slice(0, 40);
    if (tag && !form.tags.includes(tag) && form.tags.length < 12) setField("tags", [...form.tags, tag]);
    setTagInput("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.categories?.length) {
      setError("Select at least one project category.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    const endpoint = editingId ? `/api/admin/design/${editingId}` : "/api/admin/design";
    try {
      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) throw new Error(data.error || "Could not save project.");
      setNotice(form.status === "PUBLISHED" ? "Project published successfully." : "Draft saved successfully.");
      await load();
      const saved = data.id ? data : null;
      if (saved?.id) setEditingId(saved.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project.");
    } finally { setSaving(false); }
  }

  async function remove(project: Project) {
    if (!confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/design/${project.id}`, { method: "DELETE" });
    if (response.ok) {
      if (editingId === project.id) startNew();
      await load();
      setNotice("Project deleted.");
    } else setError("Could not delete this project.");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"><ArrowLeft size={13}/> Dashboard</Link>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F05A28]">Iyanu Studio · Portfolio CMS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Design projects</h1>
          <p className="mt-2 text-sm text-neutral-500">Create case studies, manage imagery and curate your public portfolio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/design" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm"><ExternalLink size={14}/> View portfolio</Link>
          <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-white hover:bg-[#F05A28]"><Plus size={15}/> New project</button>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Published</p><p className="mt-2 text-2xl font-semibold">{published}</p></div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4"><p className="text-xs text-neutral-500">Drafts</p><p className="mt-2 text-2xl font-semibold">{drafts}</p></div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">{editingId ? "Edit project" : "New project"}</h2><p className="mt-1 text-xs text-neutral-500">The fields below power the public case-study page.</p></div>{editingId && <button type="button" onClick={startNew} className="rounded-full border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50" aria-label="New project"><Plus size={15}/></button>}</div>

          <form onSubmit={save} className="mt-6 space-y-4">
            <div><label className="mb-1.5 block text-xs font-semibold">Project title *</label><input required maxLength={140} value={form.title} onChange={(e) => { const title = e.target.value; setField("title", title); if (!slugTouched) setField("slug", slugify(title)); }} className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-800" placeholder="e.g. A study in visual language"/></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-xs font-semibold">URL slug *</label><input required value={form.slug} onChange={(e) => { setSlugTouched(true); setField("slug", slugify(e.target.value)); }} className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-800" placeholder="project-name"/><p className="mt-1 text-[10px] text-neutral-400">/design/{form.slug || "project-name"}</p></div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold">Categories <span className="font-normal text-neutral-400">· Select all that apply</span></label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 p-3 sm:grid-cols-3">
                  {categoryOptions.map((category) => (
                    <label key={category} className="flex cursor-pointer items-center gap-2 py-1 text-xs text-neutral-700">
                      <input
                        type="checkbox"
                        checked={(form.categories || []).includes(category)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...(form.categories || []), category]
                            : (form.categories || []).filter((item) => item !== category);
                          setField("categories", next);
                          setField("category", next[0] || "Others");
                        }}
                        className="accent-[#F05A28]"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-xs font-semibold">Year</label><input value={form.year} onChange={(e) => setField("year", e.target.value)} maxLength={12} className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm"/></div>
              <div><label className="mb-1.5 block text-xs font-semibold">Display order</label><input type="number" min={0} max={9999} value={form.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))} className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm"/></div>
            </div>
            <div><label className="mb-1.5 block text-xs font-semibold">Short summary *</label><textarea required maxLength={300} rows={2} value={form.summary} onChange={(e) => setField("summary", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm leading-6" placeholder="A concise introduction to the project."/></div>
            <div><label className="mb-1.5 block text-xs font-semibold">Project story</label><textarea rows={5} maxLength={12000} value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm leading-6" placeholder="The brief, thinking, process and outcome. Separate paragraphs with a blank line."/></div>

            <div>
              <div className="mb-2 flex items-center justify-between"><label className="text-xs font-semibold">Cover image *</label><label className="cursor-pointer text-xs font-medium text-[#F05A28]"><input type="file" accept="image/*" className="hidden" onChange={(e) => void handleFiles(e, "cover")}/><span className="inline-flex items-center gap-1"><Upload size={13}/> Upload cover</span></label></div>
              {form.coverImage ? <div className="relative overflow-hidden rounded-xl border border-neutral-200"><img src={form.coverImage} alt="Project cover preview" className="max-h-64 w-full object-cover"/><button type="button" onClick={() => setField("coverImage", "")} className="absolute right-2 top-2 rounded-full bg-white p-2 shadow" aria-label="Remove cover"><X size={14}/></button></div> : <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-neutral-500"><ImagePlus size={22}/><span className="mt-2 text-xs">Choose a cover image</span><input type="file" accept="image/*" className="hidden" onChange={(e) => void handleFiles(e, "cover")}/></label>}
              <input value={form.coverImage} onChange={(e) => setField("coverImage", e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-xs" placeholder="Or paste an image URL"/>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between"><label className="text-xs font-semibold">Additional images</label><label className="cursor-pointer text-xs font-medium text-[#F05A28]"><input type="file" accept="image/*" className="hidden" multiple onChange={(e) => void handleFiles(e, "gallery")}/><span className="inline-flex items-center gap-1"><Plus size={13}/> Add image</span></label></div>
              {form.gallery.length > 0 ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{form.gallery.map((image, index) => <div key={`${image}-${index}`} draggable onDragStart={() => setDraggedImageIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedImageIndex !== null) moveGalleryImage(draggedImageIndex, index); setDraggedImageIndex(null); }} onDragEnd={() => setDraggedImageIndex(null)} className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-neutral-200 active:cursor-grabbing ${draggedImageIndex === index ? "opacity-40" : ""}`}><img src={image} alt={`Gallery image ${index + 1}`} className="h-full w-full object-cover"/><span className="absolute left-1 top-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white"><GripVertical size={11} className="inline"/> {index + 1}</span><div className="absolute bottom-1 left-1 flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveGalleryImage(index, index - 1)} className="rounded-full bg-white/95 p-1.5 shadow disabled:opacity-40" aria-label="Move image earlier"><ArrowUp size={12}/></button><button type="button" disabled={index === form.gallery.length - 1} onClick={() => moveGalleryImage(index, index + 1)} className="rounded-full bg-white/95 p-1.5 shadow disabled:opacity-40" aria-label="Move image later"><ArrowDown size={12}/></button></div><button type="button" onClick={() => setField("gallery", form.gallery.filter((_, i) => i !== index))} className="absolute right-1 top-1 rounded-full bg-white p-1.5 shadow" aria-label="Remove image"><X size={12}/></button></div>)}</div> : <p className="rounded-lg bg-neutral-50 px-3 py-4 text-xs text-neutral-400">No additional images yet.</p>}
              <p className="mt-1 text-[10px] text-neutral-400">Select multiple images at once, then drag to reorder them. Up to 20 images per project.</p>
            </div>

            <div><label className="mb-1.5 block text-xs font-semibold">Tags / services</label><div className="flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(e); } }} className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-sm" placeholder="e.g. Art direction"/><button type="button" onClick={() => addTag()} className="rounded-lg border border-neutral-200 px-3 text-xs font-medium">Add</button></div><div className="mt-2 flex flex-wrap gap-2">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => setField("tags", form.tags.filter((item) => item !== tag))} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">{tag} ×</button>)}</div></div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
              <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} className="accent-[#F05A28]"/> Feature this project</label>
              <label className="flex items-center gap-2 text-xs font-medium"><span>Visibility</span><select value={form.status} onChange={(e) => setField("status", e.target.value as FormProject["status"])} className="rounded-lg border border-neutral-200 bg-white px-2.5 py-2"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label>
            </div>

            {uploading && <p className="flex items-center gap-2 text-xs text-neutral-500"><LoaderCircle size={14} className="animate-spin"/> Uploading image…</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
            {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-xs text-green-700">{notice}</p>}
            <div className="flex gap-2 border-t border-neutral-100 pt-4">
              <button type="submit" disabled={saving || uploading} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-[#F05A28] disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>} {form.status === "PUBLISHED" ? "Publish project" : "Save draft"}</button>
              <button type="button" onClick={startNew} className="rounded-full border border-neutral-200 px-4 text-sm">Clear</button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="font-semibold">Your projects</h2><p className="mt-1 text-xs text-neutral-500">{projects.length} total · {published} live · Drag to reorder</p>{reordering && <p className="text-[11px] text-neutral-400">Saving order…</p>}</div><button type="button" onClick={() => void load()} className="text-xs text-neutral-500 hover:text-ink">Refresh</button></div>
          {loading ? <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">Loading projects…</div> : projects.length === 0 ? <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center"><p className="text-sm font-medium">No projects yet</p><p className="mt-1 text-xs text-neutral-500">Create your first portfolio entry.</p></div> : <div className="space-y-3">{projects.map((project) => <article key={project.id} draggable onDragStart={() => setDraggedProjectId(project.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedProjectId) moveProject(draggedProjectId, project.id); }} onDragEnd={() => setDraggedProjectId(null)} className={`flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 ${draggedProjectId === project.id ? "opacity-40" : "cursor-grab active:cursor-grabbing"}`}>
            <div className="flex items-center gap-2"><GripVertical size={17} className="shrink-0 text-neutral-300"/><div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">{project.coverImage && <img src={project.coverImage} alt="" className="h-full w-full object-cover"/>}</div></div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold">{project.title}</h3><span className={`rounded-full px-2 py-1 text-[9px] uppercase tracking-wider ${project.status === "PUBLISHED" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{project.status}</span>{project.featured && <Star size={12} className="fill-[#F05A28] text-[#F05A28]"/>}</div><p className="mt-1 text-xs text-neutral-500">{(project.categories?.length ? project.categories : [project.category]).join(" · ")} · {project.year}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{project.summary}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={projects[0]?.id === project.id || reordering} onClick={() => moveProject(project.id, projects[projects.findIndex((item) => item.id === project.id) - 1]?.id)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-[11px] disabled:opacity-30" aria-label="Move project up"><ArrowUp size={11}/></button><button type="button" disabled={projects[projects.length - 1]?.id === project.id || reordering} onClick={() => moveProject(project.id, projects[projects.findIndex((item) => item.id === project.id) + 1]?.id)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-[11px] disabled:opacity-30" aria-label="Move project down"><ArrowDown size={11}/></button><button type="button" onClick={() => edit(project)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-[11px]"><Pencil size={11}/> Edit</button>{project.status === "PUBLISHED" && <Link href={`/design/${project.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-[11px]"><ExternalLink size={11}/> View</Link>}<button type="button" onClick={() => void remove(project)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50"><Trash2 size={11}/> Delete</button></div></div>
          </article>)}</div>}
        </section>
      </div>
    </div>
  );
}
