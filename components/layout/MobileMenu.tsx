"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-white flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Close button */}
      <div className="flex justify-between items-center p-5">
        <Image src="/logo.png" alt="Logo" width={140} height={46} className="h-10 w-auto" />
        <button
          onClick={onClose}
          className="text-primary p-2"
          aria-label="Close menu"
        >
          <X size={32} />
        </button>
      </div>

      {/* Nav links */}
      <div className="flex flex-col items-center justify-center flex-1 gap-8">
        {NAV_LINKS.map((link) => (
          <div key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className={cn(
                "text-2xl font-heading font-bold tracking-wider uppercase transition-colors duration-200",
                pathname === link.href
                  ? "text-primary"
                  : "text-navy hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          </div>
        ))}

        <div className="mt-4">
          <Link
            href="/quote"
            onClick={onClose}
            className="border-2 border-primary text-primary px-8 py-3 text-lg font-heading font-bold tracking-wider uppercase hover:bg-primary hover:text-white transition-all duration-300"
          >
            Get a Quote
          </Link>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-primary-light via-primary to-primary-light" />
    </div>
  );
}
