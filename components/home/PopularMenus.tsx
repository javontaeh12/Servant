"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, ArrowRight, Loader2 } from "lucide-react";
import { MenuConfig } from "@/lib/types";

export default function PopularMenus() {
  const [menuData, setMenuData] = useState<MenuConfig | null>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: MenuConfig) => setMenuData(data))
      .catch(() => {});
  }, []);

  if (!menuData) {
    return (
      <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky/30">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </section>
    );
  }

  const presetMeals = menuData.presetMeals.filter((meal) => meal.isAvailable);
  const menuItems = menuData.items;

  const getItemNames = (itemIds: string[]) => {
    return itemIds
      .map((id) => menuItems.find((item) => item.id === id)?.name)
      .filter(Boolean);
  };

  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky/30">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            Our Most Popular Menus
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            Curated meal packages designed to delight your guests with authentic southern flavors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {presetMeals.slice(0, 3).map((meal) => (
            <div
              key={meal.id}
              className="group relative bg-white border border-sky-deep/50 p-8 lg:p-10 h-full hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {meal.image ? (
                <div className="relative w-full aspect-[16/9] -mx-8 lg:-mx-10 -mt-8 lg:-mt-10 mb-6 overflow-hidden" style={{ width: "calc(100% + 4rem)" }}>
                  <Image
                    src={meal.image}
                    alt={meal.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <ChefHat className="text-primary mb-6" size={32} strokeWidth={1.5} />
              )}
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text mb-4">
                {meal.name}
              </h3>
              <p className="text-slate-muted text-sm leading-relaxed mb-4">
                {meal.description}
              </p>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-muted mb-2 font-bold">
                  Includes:
                </p>
                <ul className="text-slate-muted text-sm space-y-1">
                  {getItemNames(meal.itemIds).map((name, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wide uppercase group-hover:gap-3 transition-all duration-300"
              >
                Get a Quote
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/quote"
            className="inline-block border border-primary/40 text-primary hover:bg-primary hover:text-white font-heading font-bold text-sm tracking-[0.15em] uppercase px-8 py-3.5 rounded-sm transition-all duration-300"
          >
            Build Your Custom Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
