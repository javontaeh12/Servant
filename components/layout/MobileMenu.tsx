"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu,
  X,
  FileText,
  Phone,
  Info,
  UtensilsCrossed,
  BookOpen,
  Images,
  ChevronRight,
  Sparkles,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MENU_PAGES = [
  { label: "Home", href: "/", icon: Home, desc: "Back to homepage" },
  { label: "About Us", href: "/about", icon: Info, desc: "Our story & values" },
  {
    label: "Specialties",
    href: "/services",
    icon: UtensilsCrossed,
    desc: "What we cater",
  },
  { label: "Menus", href: "/menus", icon: BookOpen, desc: "Meals & pricing" },
  {
    label: "Gallery",
    href: "/gallery",
    icon: Images,
    desc: "Our food & events",
  },
  { label: "Contact", href: "/contact", icon: Phone, desc: "Get in touch" },
];

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Slide-up overlay menu ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3">
                <h3 className="font-heading text-lg font-bold text-slate-text">
                  Explore
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-sky transition-colors text-slate-muted"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Page links */}
              <div className="px-4 space-y-0.5">
                {MENU_PAGES.map((page) => {
                  const isActive = pathname === page.href;
                  const Icon = page.icon;

                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all",
                        isActive
                          ? "bg-primary/8"
                          : "hover:bg-sky/80 active:bg-sky-deep"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-sky text-slate-muted"
                        )}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-primary" : "text-slate-text"
                          )}
                        >
                          {page.label}
                        </p>
                        <p className="text-[11px] text-slate-muted leading-tight">
                          {page.desc}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "shrink-0",
                          isActive
                            ? "text-primary/40"
                            : "text-slate-muted/30"
                        )}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Quote CTA inside menu */}
              <div className="px-4 pt-4">
                <Link
                  href="/quote"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide uppercase shadow-lg transition-all active:scale-[0.98]",
                    pathname === "/quote"
                      ? "bg-primary-dark text-white"
                      : "bg-primary text-white"
                  )}
                >
                  <Sparkles size={16} strokeWidth={2} />
                  Get a Free Quote
                </Link>
              </div>

              {/* Admin login */}
              <div className="px-4 pt-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-slate-muted/50 text-xs py-2 transition-colors hover:text-slate-muted"
                >
                  <LogIn size={12} />
                  Admin Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom navigation bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden">
        <div className="flex items-center justify-center px-6 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center pt-1.5 pb-1"
          >
            <Menu
              size={24}
              strokeWidth={1.8}
              className="text-slate-text transition-colors duration-200"
            />
            <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider text-slate-muted">
              Menu
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
