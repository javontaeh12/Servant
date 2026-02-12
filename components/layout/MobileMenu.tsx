"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, FileText, Phone, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Services", href: "/services", icon: UtensilsCrossed },
  { label: "Quote", href: "/quote", icon: FileText },
  { label: "Contact", href: "/contact", icon: Phone },
  { label: "Gallery", href: "/gallery", icon: ImageIcon },
];

export default function MobileMenu() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden">
      <div className="flex items-end justify-around px-4 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isQuote = item.label === "Quote";
          const Icon = item.icon;

          if (isQuote) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6 relative"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all duration-300",
                    isActive
                      ? "bg-primary-dark"
                      : "bg-primary"
                  )}
                >
                  <Icon size={24} className="text-white" strokeWidth={2} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold mt-0.5 uppercase tracking-wider transition-colors duration-200",
                    isActive ? "text-primary" : "text-slate-muted"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center pt-2 pb-1 min-w-[3.5rem]"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-primary" : "text-slate-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold mt-1 uppercase tracking-wider transition-colors duration-200",
                  isActive ? "text-primary" : "text-slate-muted"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
