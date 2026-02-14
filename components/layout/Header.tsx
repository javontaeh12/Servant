"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "left-0 right-0 z-50 transition-all duration-500 relative md:fixed md:top-0",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="I'm A Servant First LLC"
            width={160}
            height={80}
            className="h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-xs font-body font-bold tracking-[0.15em] uppercase transition-colors duration-300 py-1",
                pathname === link.href
                  ? "text-primary"
                  : "text-slate-text/60 hover:text-primary"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary" />
              )}
            </Link>
          ))}
          <Link
            href="/quote"
            className="bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-2.5 rounded-sm hover:bg-primary-dark transition-all duration-300"
          >
            Get a Quote
          </Link>
        </div>
      </nav>
    </header>
  );
}
