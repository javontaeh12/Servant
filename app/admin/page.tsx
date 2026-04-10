"use client";

import { useState, useEffect, useRef } from "react";
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
  Bell,
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<{
    id: string; clientName: string; eventDate: string; eventType: string; eventTime: string;
  }[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

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

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: string; status: string; clientName: string; eventDate: string; eventType: string; eventTime: string }[]) => {
        setPendingBookings(data.filter((b) => b.status === "pending"));
      })
      .catch(() => {});
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
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-primary transition-colors px-3 py-2 border border-sky-deep rounded-sm"
                title={pendingBookings.length > 0 ? `${pendingBookings.length} pending booking${pendingBookings.length !== 1 ? "s" : ""}` : "No pending bookings"}
              >
                <Bell size={14} />
                {pendingBookings.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {pendingBookings.length > 9 ? "9+" : pendingBookings.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute z-30 top-full right-0 mt-1 w-72 bg-white border border-sky-deep rounded-sm shadow-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-sky-deep bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-text">Pending Bookings</span>
                    {pendingBookings.length > 0 && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {pendingBookings.length}
                      </span>
                    )}
                  </div>
                  {pendingBookings.length === 0 ? (
                    <div className="px-4 py-5 text-center text-xs text-slate-muted">
                      No pending bookings
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto divide-y divide-sky-deep">
                        {pendingBookings.map((b) => {
                          const date = b.eventDate
                            ? new Date(b.eventDate + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : b.eventDate;
                          return (
                            <button
                              key={b.id}
                              onClick={() => {
                                setActiveTab("bookings");
                                setNotifOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-sky-deep/30 transition-colors"
                            >
                              <p className="text-xs font-bold text-slate-text leading-tight">{b.clientName}</p>
                              <p className="text-[11px] text-slate-muted mt-0.5">{b.eventType} · {date}</p>
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-sky-deep px-4 py-2.5">
                        <button
                          onClick={() => {
                            setActiveTab("bookings");
                            setNotifOpen(false);
                          }}
                          className="w-full text-xs font-bold text-primary hover:underline text-center"
                        >
                          View all bookings
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
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
