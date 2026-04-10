"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Upload,
  Trash2,
  ImageIcon,
} from "lucide-react";

interface SiteSettings {
  quoteFormMode: "builder" | "simple";
  featuredImage: string;
  featuredImageActive: boolean;
  showBusinessHours: boolean;
}

export default function SiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleQuoteForm = async () => {
    if (!settings || saving) return;
    const newMode = settings.quoteFormMode === "builder" ? "simple" : "builder";
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteFormMode: newMode }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings(updated);
      showSaved();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleBusinessHours = async () => {
    if (!settings || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showBusinessHours: !settings.showBusinessHours }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings(updated);
      showSaved();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedImage = async () => {
    if (!settings || saving || !settings.featuredImage) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredImageActive: !settings.featuredImageActive }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings(updated);
      showSaved();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/site-settings/image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setSettings((prev) =>
        prev ? { ...prev, featuredImage: data.url, featuredImageActive: true } : prev
      );
      showSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!settings?.featuredImage) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/site-settings/image", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSettings((prev) =>
        prev ? { ...prev, featuredImage: "", featuredImageActive: false } : prev
      );
      showSaved();
    } catch {
      setError("Failed to delete image.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-slate-text mb-1">Site Settings</h2>
        <p className="text-slate-muted text-sm">Control how your public-facing website behaves.</p>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
          {error}
        </p>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 px-4 py-3 rounded-sm">
          <CheckCircle2 size={16} /> Settings saved.
        </div>
      )}

      {/* Featured Image */}
      <div className="border border-sky-deep rounded-sm p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-text mb-1">
                Featured Image
              </h3>
              <p className="text-slate-muted text-sm">
                Displayed on the homepage after the hero and specialties sections.
              </p>
            </div>
            {settings?.featuredImage && (
              <button
                onClick={toggleFeaturedImage}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 px-4 py-2.5 sm:py-2 text-sm font-bold border border-sky-deep hover:border-primary hover:text-primary transition-colors rounded-sm disabled:opacity-50"
              >
                {settings.featuredImageActive ? (
                  <>
                    <ToggleRight size={18} className="text-green-600" />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft size={18} className="text-slate-muted" />
                    Inactive
                  </>
                )}
              </button>
            )}
          </div>

          {/* Image preview */}
          {settings?.featuredImage ? (
            <div className="relative">
              <div className="relative overflow-hidden rounded-sm border border-sky-deep">
                <Image
                  src={settings.featuredImage}
                  alt="Featured image"
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="w-full h-auto"
                />
                {!settings.featuredImageActive && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="text-slate-muted text-sm font-bold uppercase tracking-wide bg-white/90 px-4 py-2 rounded-sm border border-sky-deep">
                      Hidden on site
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors px-3 py-2 border border-sky-deep rounded-sm"
                >
                  <Upload size={14} />
                  Replace
                </button>
                <button
                  onClick={handleDeleteImage}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-2 border border-red-200 rounded-sm"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-sky-deep rounded-sm hover:border-primary/40 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 size={24} className="animate-spin text-primary" />
              ) : (
                <ImageIcon size={32} className="text-slate-muted/40" strokeWidth={1.5} />
              )}
              <span className="text-sm text-slate-muted">
                {uploading ? "Uploading..." : "Click to upload a featured image"}
              </span>
              <span className="text-xs text-slate-muted/60">JPEG, PNG, or WebP (max 5MB)</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Business Hours Toggle */}
      <div className="border border-sky-deep rounded-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-text mb-1">
              Business Hours
            </h3>
            <p className="text-slate-muted text-sm">
              Show or hide your business hours in the footer and contact page.
            </p>
          </div>
          <button
            onClick={toggleBusinessHours}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 px-4 py-2.5 sm:py-2 text-sm font-bold border border-sky-deep hover:border-primary hover:text-primary transition-colors rounded-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : settings?.showBusinessHours ? (
              <>
                <ToggleRight size={18} className="text-green-600" />
                Visible
              </>
            ) : (
              <>
                <ToggleLeft size={18} className="text-slate-muted" />
                Hidden
              </>
            )}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-sky-deep">
          <p className="text-xs text-slate-muted">
            <span className="font-bold">Currently:</span>{" "}
            <span className={`font-medium ${settings?.showBusinessHours ? "text-green-600" : "text-slate-muted"}`}>
              {settings?.showBusinessHours ? "Showing hours on the website" : "Hours hidden from the website"}
            </span>
          </p>
        </div>
      </div>

      {/* Quote Form Toggle */}
      <div className="border border-sky-deep rounded-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-text mb-1">
              Quote Request Form
            </h3>
            <p className="text-slate-muted text-sm mb-3">
              Choose which form customers see on the{" "}
              <span className="font-medium text-slate-text">/quote</span> page.
            </p>
            <div className="space-y-2 text-sm">
              <div className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2 p-3 rounded-sm border ${settings?.quoteFormMode === "builder" ? "border-primary bg-primary/5" : "border-sky-deep"}`}>
                <span className="font-bold text-slate-text shrink-0">Builder {settings?.quoteFormMode === "builder" ? "✓" : ""}</span>
                <span className="text-slate-muted text-xs sm:text-sm">Multi-step wizard with meal selection, add-ons, and real-time pricing.</span>
              </div>
              <div className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2 p-3 rounded-sm border ${settings?.quoteFormMode === "simple" ? "border-primary bg-primary/5" : "border-sky-deep"}`}>
                <span className="font-bold text-slate-text shrink-0">Simple {settings?.quoteFormMode === "simple" ? "✓" : ""}</span>
                <span className="text-slate-muted text-xs sm:text-sm">Clean single-page form collecting contact info, event details, and guest count.</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleQuoteForm}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 px-4 py-2.5 sm:py-2 text-sm font-bold border border-sky-deep hover:border-primary hover:text-primary transition-colors rounded-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : settings?.quoteFormMode === "builder" ? (
              <>
                <ToggleLeft size={18} className="text-slate-muted" />
                Switch to Simple
              </>
            ) : (
              <>
                <ToggleRight size={18} className="text-primary" />
                Switch to Builder
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-sky-deep">
          <p className="text-xs text-slate-muted">
            <span className="font-bold">Currently showing:</span>{" "}
            <span className="text-primary font-medium capitalize">
              {settings?.quoteFormMode === "builder" ? "Quote Builder (multi-step)" : "Simple Quote Form"}
            </span>{" "}
            on the public website.
          </p>
        </div>
      </div>
    </div>
  );
}
