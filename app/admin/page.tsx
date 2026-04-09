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
  ChevronDown,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

        {/* Tab dropdown */}
        <div className="relative mb-8">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 border border-sky-deep rounded-sm bg-white text-slate-text font-bold text-sm"
          >
            <span className="flex items-center gap-2">
              {(() => {
                const tab = TABS.find((t) => t.id === activeTab)!;
                const Icon = tab.icon;
                return (
                  <>
                    <Icon size={15} className="text-primary" />
                    {tab.label}
                  </>
                );
              })()}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "text-slate-muted transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-sky-deep rounded-sm shadow-lg overflow-hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-muted hover:bg-gray-50 hover:text-slate-text"
                    )}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
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
