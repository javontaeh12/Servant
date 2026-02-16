"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { GalleryImage, GalleryConfig } from "@/lib/types";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

export default function GalleryTab() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data: GalleryConfig) => setImages(data.images))
      .catch(() => setSaveError("Failed to load gallery"))
      .finally(() => setLoading(false));
  }, []);

  const saveImages = async (updated: GalleryImage[]) => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updated }),
      });
      if (!res.ok) throw new Error("Failed to save");

      setImages(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save gallery");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (images.length >= 20) {
      setSaveError("Maximum of 20 images allowed");
      return;
    }

    setUploading(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/gallery/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newImage: GalleryImage = {
        id: Date.now().toString(),
        src: data.path,
        caption,
        sortOrder: images.length,
      };

      await saveImages([...images, newImage]);
      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      setShowUpload(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    setDeleting(image.id);
    setSaveError(null);

    try {
      await fetch(`/api/gallery/image?src=${encodeURIComponent(image.src)}`, {
        method: "DELETE",
      });

      const updated = images
        .filter((img) => img.id !== image.id)
        .map((img, i) => ({ ...img, sortOrder: i }));

      await saveImages(updated);
    } catch {
      setSaveError("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    const renumbered = reordered.map((img, i) => ({ ...img, sortOrder: i }));

    setImages(renumbered);
    await saveImages(renumbered);
  };

  const startEditCaption = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditCaption(image.caption);
  };

  const saveCaptionEdit = async () => {
    if (!editingId) return;

    const updated = images.map((img) =>
      img.id === editingId ? { ...img, caption: editCaption } : img
    );

    setEditingId(null);
    await saveImages(updated);
  };

  const cancelUpload = () => {
    setShowUpload(false);
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-text">
            Gallery
          </h2>
          <p className="text-slate-muted text-sm mt-1">
            {images.length}/20 images &middot;
            Images shown on the homepage
          </p>
        </div>
        {images.length < 20 && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 text-xs font-bold tracking-wide uppercase hover:bg-primary/90 transition-colors rounded-sm"
          >
            <Plus size={14} />
            Add Image
          </button>
        )}
      </div>

      {/* Status messages */}
      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-sm px-4 py-2">
          <Check size={16} />
          Saved
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-sm px-4 py-2">
          <X size={16} />
          {saveError}
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="border border-sky-deep rounded-sm p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-sm font-bold text-slate-text uppercase tracking-wide">
              Upload Image
            </h3>
            <button
              onClick={cancelUpload}
              className="text-slate-muted hover:text-slate-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label className={labelClass}>Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-sky-deep rounded-sm p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              {preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-sm"
                />
              ) : (
                <div className="space-y-2">
                  <Upload
                    className="mx-auto text-slate-muted"
                    size={28}
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-slate-muted">
                    Click to select an image
                  </p>
                  <p className="text-xs text-slate-muted/70">
                    JPEG, PNG, or WebP up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className={labelClass}>Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this image..."
              className={inputClass}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center justify-center gap-2 w-full bg-primary text-white px-4 py-3 text-xs font-bold tracking-wide uppercase hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload Image
              </>
            )}
          </button>
        </div>
      )}

      {/* Image list */}
      {images.length === 0 ? (
        <div className="text-center py-16 border border-sky-deep rounded-sm">
          <ImageIcon
            className="mx-auto text-slate-muted/40 mb-4"
            size={40}
            strokeWidth={1.5}
          />
          <p className="text-slate-muted font-medium">No images yet</p>
          <p className="text-slate-muted/70 text-sm mt-1">
            Upload your first image to start building your gallery
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex gap-4 p-4 border border-sky-deep rounded-sm bg-white hover:border-primary/20 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-sm overflow-hidden bg-sky/50 relative">
                <Image
                  src={image.src}
                  alt={image.caption || "Gallery image"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                {editingId === image.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCaptionEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className={inputClass}
                      autoFocus
                    />
                    <button
                      onClick={saveCaptionEdit}
                      disabled={saving}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-slate-muted hover:bg-sky/50 rounded-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-slate-text truncate">
                      {image.caption || (
                        <span className="text-slate-muted italic">No caption</span>
                      )}
                    </p>
                    <button
                      onClick={() => startEditCaption(image)}
                      className="p-1 text-slate-muted hover:text-primary rounded-sm transition-colors flex-shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-muted mt-1">
                  Position {index + 1} of {images.length}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3">
                  <button
                    onClick={() => handleReorder(index, "up")}
                    disabled={index === 0 || saving}
                    className="p-1.5 text-slate-muted hover:text-primary hover:bg-sky/50 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleReorder(index, "down")}
                    disabled={index === images.length - 1 || saving}
                    className="p-1.5 text-slate-muted hover:text-primary hover:bg-sky/50 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(image)}
                    disabled={deleting === image.id}
                    className="p-1.5 text-slate-muted hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                    title="Delete image"
                  >
                    {deleting === image.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
