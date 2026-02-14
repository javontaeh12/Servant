"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BusinessInfo } from "@/lib/types";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

// TikTok icon (not in lucide)
function TikTokIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIAL_PLATFORMS = [
  { key: "facebook" as const, label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
  { key: "instagram" as const, label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourpage" },
  { key: "twitter" as const, label: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  { key: "tiktok" as const, label: "TikTok", icon: TikTokIcon, placeholder: "https://tiktok.com/@yourhandle" },
  { key: "youtube" as const, label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@yourchannel" },
];

export default function BusinessTab() {
  const [config, setConfig] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/business")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setSaveError("Failed to load business info"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
      }
    } catch {
      setSaveError("Failed to save business info");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    setUploading(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/business/image", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...config, aboutImage: data.path });
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to upload image");
      }
    } catch {
      setSaveError("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    if (!config) return;
    setConfig({ ...config, aboutImage: "" });
  };

  const updateAboutParagraph = (index: number, value: string) => {
    if (!config) return;
    const aboutUs = [...config.aboutUs];
    aboutUs[index] = value;
    setConfig({ ...config, aboutUs });
  };

  const addParagraph = () => {
    if (!config) return;
    setConfig({ ...config, aboutUs: [...config.aboutUs, ""] });
  };

  const removeParagraph = (index: number) => {
    if (!config) return;
    const aboutUs = config.aboutUs.filter((_, i) => i !== index);
    setConfig({ ...config, aboutUs });
  };

  const updateSocialLink = (key: keyof BusinessInfo["socialLinks"], value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      socialLinks: { ...config.socialLinks, [key]: value },
    });
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Contact Information */}
      <section className="mb-10">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          Contact Information
        </h2>
        <p className="text-slate-muted/60 text-xs mb-4">
          This email and phone number will be displayed on the website.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Business Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              placeholder="info@yourbusiness.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              placeholder="City, State"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Weekday Hours</label>
            <input
              type="text"
              value={config.hours.weekdays}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hours: { ...config.hours, weekdays: e.target.value },
                })
              }
              placeholder="Mon - Fri: 9:00 AM - 7:00 PM"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Weekend Hours</label>
            <input
              type="text"
              value={config.hours.weekends}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hours: { ...config.hours, weekends: e.target.value },
                })
              }
              placeholder="Sat - Sun: 10:00 AM - 5:00 PM"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
              About Us
            </h2>
            <p className="text-slate-muted/60 text-xs mt-1">
              This content will be displayed on the About page.
            </p>
          </div>
          <button
            onClick={addParagraph}
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
          >
            <Plus size={14} /> Add Paragraph
          </button>
        </div>
        <div className="space-y-4">
          {config.aboutUs.map((paragraph, index) => (
            <div key={index} className="flex gap-3">
              <textarea
                value={paragraph}
                onChange={(e) => updateAboutParagraph(index, e.target.value)}
                placeholder={`Paragraph ${index + 1}`}
                rows={4}
                className={cn(inputClass, "flex-1 resize-y")}
              />
              {config.aboutUs.length > 1 && (
                <button
                  onClick={() => removeParagraph(index)}
                  className="p-2 -m-2 text-red-400 hover:text-red-600 transition-colors self-start mt-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* About Image */}
      <section className="mb-10">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          About Page Image
        </h2>
        <p className="text-slate-muted/60 text-xs mb-4">
          This image will be shown on the About page alongside your story.
        </p>

        {config.aboutImage ? (
          <div className="relative inline-block">
            <div className="w-48 h-60 relative border border-sky-deep rounded-sm overflow-hidden">
              <Image
                src={config.aboutImage}
                alt="About page image"
                fill
                className="object-cover"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="w-48 h-60 border-2 border-dashed border-sky-deep rounded-sm flex flex-col items-center justify-center text-slate-muted/50">
            <Upload size={24} className="mb-2" />
            <span className="text-xs">No image</span>
          </div>
        )}

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-xs font-bold text-primary border border-primary/30 px-4 py-2.5 rounded-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Uploading...
              </>
            ) : (
              <>
                <Upload size={14} /> {config.aboutImage ? "Replace Image" : "Upload Image"}
              </>
            )}
          </button>
        </div>
      </section>

      {/* Social Links */}
      <section className="mb-10">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          Social Links
        </h2>
        <p className="text-slate-muted/60 text-xs mb-4">
          Links will appear as buttons on the Contact page. Leave blank to hide a platform.
        </p>
        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.key} className="flex items-center gap-3">
                <div className="w-10 h-10 border border-sky-deep bg-sky/50 flex items-center justify-center rounded-sm flex-shrink-0">
                  <Icon size={16} className="text-slate-muted" />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>{platform.label}</label>
                  <input
                    type="url"
                    value={config.socialLinks[platform.key]}
                    onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className={inputClass}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t border-sky-deep py-4 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 size={16} /> Saved successfully
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} /> {saveError}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center justify-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
