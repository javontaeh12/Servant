"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  LogOut,
  Home,
  Building2,
  Images,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

const BookingsTab = dynamic(() => import("@/components/admin/BookingsTab"));
const BusinessTab = dynamic(() => import("@/components/admin/BusinessTab"));
const GalleryTab = dynamic(() => import("@/components/admin/GalleryTab"));
const SpecialtiesTab = dynamic(() => import("@/components/admin/SpecialtiesTab"));
const SiteSettingsTab = dynamic(() => import("@/components/admin/SiteSettingsTab"));

const TABS = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "business", label: "Business", icon: Building2 },
  { id: "specialties", label: "Specialties", icon: Sparkles },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "site-settings", label: "Site Settings", icon: ToggleLeft },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("bookings");
  const [session, setSession] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setSession({ email: data.email, name: data.name });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-text mb-1">
              Admin Portal
            </h1>
            <p className="text-slate-muted text-sm">
              {session
                ? `Signed in as ${session.name.split(" ").pop()?.charAt(0).toUpperCase()}${session.name.split(" ").pop()?.slice(1).toLowerCase() || session.name}`
                : "Manage bookings, business info, and site settings."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-primary transition-colors px-3 py-2 border border-sky-deep rounded-sm"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-red-500 transition-colors px-3 py-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="relative">
          <div className="flex gap-1 border-b border-sky-deep mb-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  aria-label={tab.label}
                  className={cn(
                    "flex items-center gap-1 px-2 sm:px-3 md:px-5 py-3 text-[10px] sm:text-xs font-bold tracking-[0.05em] sm:tracking-[0.1em] uppercase transition-all border-b-2 whitespace-nowrap snap-start",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-muted hover:text-slate-text"
                  )}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Scroll fade hint on right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Tab content */}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "business" && <BusinessTab />}
        {activeTab === "specialties" && <SpecialtiesTab />}
        {activeTab === "gallery" && <GalleryTab />}
        {activeTab === "site-settings" && <SiteSettingsTab />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        }
      >
        <AdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
