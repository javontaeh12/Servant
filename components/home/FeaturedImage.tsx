"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Settings {
  featuredImage: string;
  featuredImageActive: boolean;
}

export default function FeaturedImage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  if (!settings?.featuredImage || !settings.featuredImageActive) return null;

  return (
    <section className="px-6 sm:px-8 py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative aspect-[16/7] overflow-hidden rounded-sm">
          <Image
            src={settings.featuredImage}
            alt="Featured"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
