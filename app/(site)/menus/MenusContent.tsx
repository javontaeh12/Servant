"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { MenuConfig } from "@/lib/types";

export default function MenusContent() {
  const [menuData, setMenuData] = useState<MenuConfig | null>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: MenuConfig) => setMenuData(data))
      .catch(() => {});
  }, []);

  if (!menuData) {
    return (
      <>
        <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
              Curated for You
            </p>
            <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
              Our Menus
            </h1>
          </div>
        </section>
        <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        </section>
      </>
    );
  }

  const presetMeals = menuData.presetMeals.filter((meal) => meal.isAvailable);
  const menuItems = menuData.items;
  const categories = menuData.categories;

  const getItemsByCategory = (itemIds: string[]) => {
    const items = itemIds
      .map((id) => menuItems.find((item) => item.id === id))
      .filter(Boolean);

    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      if (!item) continue;
      const cat = categories.find((c) => c.id === item.categoryId);
      const catName = cat?.name || "Other";
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    }
    return grouped;
  };

  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Curated for You
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Our Menus
          </h1>
          <div
            className="animate-line-grow h-[2px] bg-primary mx-auto mt-6"
            style={{ animationDelay: "0.3s" }}
          />
          <p className="text-slate-muted text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Hand-crafted meal packages featuring our most beloved southern
            dishes. Each menu is designed to create an unforgettable dining
            experience for your guests.
          </p>
        </div>
      </section>

      {/* Menu Cards */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-20 md:space-y-28">
          {presetMeals.map((meal, i) => {
            const isEven = i % 2 === 1;
            const grouped = getItemsByCategory(meal.itemIds);
            const mealImage = (meal as { image?: string }).image;

            return (
              <div key={meal.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Image */}
                  <div className={isEven ? "md:order-2" : ""}>
                    <div className="aspect-[4/3] relative overflow-hidden rounded-sm border border-sky-deep/50">
                      {mealImage ? (
                        <Image
                          src={mealImage}
                          alt={meal.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-sky via-sky-deep/30 to-primary/10 flex items-center justify-center">
                          <div className="text-center">
                            <ChefHat
                              className="text-primary/20 mx-auto mb-3"
                              size={72}
                              strokeWidth={1}
                            />
                            <p className="text-primary/30 text-sm font-heading font-bold tracking-wide uppercase">
                              {meal.name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={isEven ? "md:order-1" : ""}>
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles
                        className="text-primary"
                        size={18}
                        strokeWidth={1.5}
                      />
                      <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
                        Popular Menus
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-slate-text mb-3">
                      {meal.name}
                    </h2>

                    <p className="text-slate-muted text-[15px] leading-[1.8] mb-7">
                      {meal.description}
                    </p>

                    {/* Items grouped by category */}
                    <div className="space-y-4 mb-8">
                      {Object.entries(grouped).map(([catName, items]) => (
                        <div key={catName}>
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-muted font-bold mb-2">
                            {catName}
                          </p>
                          <ul className="space-y-1.5">
                            {items.map((item) =>
                              item ? (
                                <li
                                  key={item.id}
                                  className="flex items-start gap-2.5 text-slate-text text-sm"
                                >
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  <span>
                                    <span className="font-medium">
                                      {item.name}
                                    </span>
                                    <span className="text-slate-muted ml-1.5">
                                      &mdash; {item.description}
                                    </span>
                                  </span>
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/quote?menu=${encodeURIComponent(meal.name)}`}
                      className="inline-flex items-center gap-2 border border-primary/40 text-primary hover:bg-primary hover:text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-7 py-3 rounded-sm transition-all duration-300 group"
                    >
                      Get a Quote
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Custom Menu CTA */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-sky/50">
        <div className="max-w-2xl mx-auto text-center">
          <ChefHat
            className="text-primary mx-auto mb-6"
            size={40}
            strokeWidth={1.5}
          />
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-text mb-5">
            Don&apos;t See What You&apos;re Looking For?
          </h3>
          <div className="w-10 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-slate-muted text-[15px] leading-[1.8] mb-10">
            Every event is unique. We love building custom menus tailored to
            your taste, dietary needs, and vision. Let us create something
            special just for you.
          </p>
          <Link
            href="/quote"
            className="inline-block bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
          >
            Build Your Custom Menu
          </Link>
        </div>
      </section>
    </>
  );
}
