"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Upload,
  Trash2,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { SERVICES } from "@/lib/constants";

type SpecialtyImages = Record<string, string>;

export default function SpecialtiesTab() {
  const [images, setImages] = useState<SpecialtyImages>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch(() => setError("Failed to load specialty images"))
      .finally(() => setLoading(false));
  }, []);

  const saveMapping = async (updated: SpecialtyImages) => {
    try {
      const res = await fetch("/api/specialties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to save");
      setImages(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save");
    }
  };

  const handleUpload = async (serviceName: string, file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB");
      return;
    }

    setUploading(serviceName);
    setError(null);

    try {
      // Delete old image if exists
      if (images[serviceName]) {
        await fetch(`/api/specialties/image?url=${encodeURIComponent(images[serviceName])}`, {
          method: "DELETE",
        });
      }

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/specialties/image", {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        setError("Session expired — please log out and log back in");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);

      await saveMapping({ ...images, [serviceName]: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — check your connection and try again");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (serviceName: string) => {
    setDeleting(serviceName);
    setError(null);

    try {
      if (images[serviceName]) {
        await fetch(`/api/specialties/image?url=${encodeURIComponent(images[serviceName])}`, {
          method: "DELETE",
        });
      }

      const updated = { ...images };
      delete updated[serviceName];
      await saveMapping(updated);
    } catch {
      setError("Failed to delete");
    } finally {
      setDeleting(null);
    }
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
      <div>
        <h2 className="font-heading text-xl font-bold text-slate-text">
          Specialty Images
        </h2>
        <p className="text-slate-muted text-sm mt-1">
          Upload images for each event specialty. These appear on the homepage
          and services page.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-sm px-4 py-2">
          <Check size={16} /> Saved
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-sm px-4 py-2">
          <X size={16} /> {error}
        </div>
      )}

      <div className="space-y-3">
        {SERVICES.map((service) => {
          const imageUrl = images[service.name];
          const isUploading = uploading === service.name;
          const isDeleting = deleting === service.name;

          return (
            <div
              key={service.name}
              className="flex items-center gap-4 p-4 border border-sky-deep rounded-sm bg-white hover:border-primary/20 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-sky/50 relative border border-sky-deep">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={20} className="text-slate-muted/30" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-text truncate">
                  {service.name}
                </p>
                <p className="text-xs text-slate-muted">
                  {imageUrl ? "Image uploaded" : "No image"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  ref={(el) => { fileRefs.current[service.name] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(service.name, file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileRefs.current[service.name]?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors px-3 py-2 border border-sky-deep rounded-sm hover:border-primary/30 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  {imageUrl ? "Replace" : "Upload"}
                </button>
                {imageUrl && (
                  <button
                    onClick={() => handleDelete(service.name)}
                    disabled={isDeleting}
                    className="p-2 text-slate-muted hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                    title="Remove image"
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
