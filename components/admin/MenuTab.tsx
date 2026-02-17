"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuConfig, MenuCategory, MenuItem, PresetMeal } from "@/lib/types";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

type SectionKey = "categories" | "items" | "presets";

export default function MenuTab() {
  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    { categories: false, items: false, presets: false }
  );
  const [openItemCategories, setOpenItemCategories] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: MenuConfig) => {
        setConfig(data);
        // All item categories start collapsed
      })
      .catch(() => setSaveError("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleItemCategory = (catId: string) => {
    setOpenItemCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
      }
    } catch {
      setSaveError("Failed to save menu config");
    } finally {
      setSaving(false);
    }
  };

  // Category helpers
  const addCategory = () => {
    if (!config) return;
    const id = `cat_${Date.now()}`;
    const maxOrder = config.categories.reduce(
      (max, c) => Math.max(max, c.sortOrder),
      0
    );
    setConfig({
      ...config,
      categories: [
        ...config.categories,
        { id, name: "", sortOrder: maxOrder + 1 },
      ],
    });
    setOpenSections((prev) => ({ ...prev, categories: true }));
  };

  const updateCategory = (
    index: number,
    field: keyof MenuCategory,
    value: string | number
  ) => {
    if (!config) return;
    const categories = [...config.categories];
    categories[index] = { ...categories[index], [field]: value };
    setConfig({ ...config, categories });
  };

  const removeCategory = (index: number) => {
    if (!config) return;
    const id = config.categories[index].id;
    setConfig({
      ...config,
      categories: config.categories.filter((_, i) => i !== index),
      items: config.items.filter((item) => item.categoryId !== id),
    });
  };

  const moveCategoryUp = (index: number) => {
    if (!config || index === 0) return;
    const categories = [...config.categories];
    const tempOrder = categories[index].sortOrder;
    categories[index] = {
      ...categories[index],
      sortOrder: categories[index - 1].sortOrder,
    };
    categories[index - 1] = {
      ...categories[index - 1],
      sortOrder: tempOrder,
    };
    categories.sort((a, b) => a.sortOrder - b.sortOrder);
    setConfig({ ...config, categories });
  };

  const moveCategoryDown = (index: number) => {
    if (!config || index === config.categories.length - 1) return;
    const categories = [...config.categories];
    const tempOrder = categories[index].sortOrder;
    categories[index] = {
      ...categories[index],
      sortOrder: categories[index + 1].sortOrder,
    };
    categories[index + 1] = {
      ...categories[index + 1],
      sortOrder: tempOrder,
    };
    categories.sort((a, b) => a.sortOrder - b.sortOrder);
    setConfig({ ...config, categories });
  };

  // Item helpers
  const addItem = () => {
    if (!config) return;
    const id = `item_${Date.now()}`;
    const defaultCategory = config.categories[0]?.id || "";
    setConfig({
      ...config,
      items: [
        ...config.items,
        {
          id,
          name: "",
          description: "",
          categoryId: defaultCategory,
          pricePerPerson: 0,
          isAvailable: true,
        },
      ],
    });
    setOpenSections((prev) => ({ ...prev, items: true }));
    if (defaultCategory) {
      setOpenItemCategories((prev) => ({ ...prev, [defaultCategory]: true }));
    }
  };

  const updateItem = (
    index: number,
    field: keyof MenuItem,
    value: string | number | boolean
  ) => {
    if (!config) return;
    const items = [...config.items];
    items[index] = { ...items[index], [field]: value };
    setConfig({ ...config, items });
  };

  const removeItem = (index: number) => {
    if (!config) return;
    const itemId = config.items[index].id;
    setConfig({
      ...config,
      items: config.items.filter((_, i) => i !== index),
      presetMeals: config.presetMeals.map((pm) => ({
        ...pm,
        itemIds: pm.itemIds.filter((id) => id !== itemId),
      })),
    });
  };

  // Preset Meal helpers
  const addPresetMeal = () => {
    if (!config) return;
    const id = `preset_${Date.now()}`;
    setConfig({
      ...config,
      presetMeals: [
        ...config.presetMeals,
        {
          id,
          name: "",
          description: "",
          itemIds: [],
          pricePerPerson: 0,
          isAvailable: true,
        },
      ],
    });
    setOpenSections((prev) => ({ ...prev, presets: true }));
  };

  const updatePresetMeal = (
    index: number,
    field: keyof PresetMeal,
    value: string | number | boolean | string[]
  ) => {
    if (!config) return;
    const presetMeals = [...config.presetMeals];
    presetMeals[index] = { ...presetMeals[index], [field]: value };
    setConfig({ ...config, presetMeals });
  };

  const togglePresetItem = (presetIndex: number, itemId: string) => {
    if (!config) return;
    const preset = config.presetMeals[presetIndex];
    const newItemIds = preset.itemIds.includes(itemId)
      ? preset.itemIds.filter((id) => id !== itemId)
      : [...preset.itemIds, itemId];
    updatePresetMeal(presetIndex, "itemIds", newItemIds);
  };

  const removePresetMeal = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      presetMeals: config.presetMeals.filter((_, i) => i !== index),
    });
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const sortedCategories = [...config.categories].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // Render a collapsible section card
  const renderSection = (
    key: SectionKey,
    title: string,
    count: number,
    onAdd: () => void,
    addLabel: string,
    children: React.ReactNode
  ) => (
    <div className="border border-sky-deep rounded-sm overflow-hidden mb-6">
      {/* Section header */}
      <button
        type="button"
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between px-4 py-3 bg-sky/30 hover:bg-sky/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={16}
            className={cn(
              "text-primary transition-transform duration-200",
              openSections[key] && "rotate-90"
            )}
          />
          <span className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
            {title}
          </span>
          <span className="text-slate-muted text-xs">({count})</span>
        </div>
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
        >
          <Plus size={14} /> {addLabel}
        </span>
      </button>
      {/* Animated body */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          openSections[key] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );

  // Render a collapsible category group within Items
  const renderCategoryGroup = (
    cat: MenuCategory,
    catItems: { item: MenuItem; index: number }[]
  ) => {
    const isOpen = openItemCategories[cat.id] ?? false;
    return (
      <div key={cat.id} className="border border-sky-deep/50 rounded-sm mb-3">
        <button
          type="button"
          onClick={() => toggleItemCategory(cat.id)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-sky/30 transition-colors"
        >
          <ChevronRight
            size={14}
            className={cn(
              "text-slate-muted transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <span className="text-slate-text text-sm font-bold">
            {cat.name || "Unnamed"}
          </span>
          <span className="text-slate-muted text-xs">
            ({catItems.length})
          </span>
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-in-out",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 space-y-5">
              {catItems.map(({ item, index }) => renderItemCard(item, index))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a single item card
  const renderItemCard = (item: MenuItem, index: number) => (
    <div
      key={item.id}
      className="border border-sky-deep rounded-sm p-5 space-y-4 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              placeholder="Item name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={item.categoryId}
              onChange={(e) =>
                updateItem(index, "categoryId", e.target.value)
              }
              className={cn(inputClass, "appearance-none")}
            >
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || "Unnamed"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => removeItem(index)}
          className="p-2 -m-2 text-red-400 hover:text-red-600 transition-colors mt-6"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <input
          type="text"
          value={item.description}
          onChange={(e) => updateItem(index, "description", e.target.value)}
          placeholder="Short description"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div>
          <label className={labelClass}>Price / Person</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
              $
            </span>
            <input
              type="number"
              value={item.pricePerPerson}
              onChange={(e) =>
                updateItem(
                  index,
                  "pricePerPerson",
                  parseFloat(e.target.value) || 0
                )
              }
              className={cn(inputClass, "pl-7 w-full md:w-28")}
            />
          </div>
        </div>
        <div className="sm:pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isAvailable}
              onChange={(e) =>
                updateItem(index, "isAvailable", e.target.checked)
              }
              className="accent-primary w-5 h-5"
            />
            <span className="text-sm text-slate-text">Available</span>
          </label>
        </div>
      </div>
    </div>
  );

  const q = searchQuery.toLowerCase().trim();

  const matchedItems = q
    ? config.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    : config.items;

  const matchedPresets = q
    ? config.presetMeals.filter(
        (pm) =>
          pm.name.toLowerCase().includes(q) ||
          pm.description.toLowerCase().includes(q)
      )
    : config.presetMeals;

  const matchedCategories = q
    ? config.categories.filter((cat) => cat.name.toLowerCase().includes(q))
    : config.categories;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted/50"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories, items, or popular meals..."
          className={cn(inputClass, "pl-10")}
        />
      </div>

      {/* Categories Section */}
      {renderSection(
        "categories",
        "Categories",
        matchedCategories.length,
        addCategory,
        "Add Category",
        <div className="space-y-2">
          {sortedCategories
            .filter((cat) => matchedCategories.some((mc) => mc.id === cat.id))
            .map((cat, displayIndex) => {
            const realIndex = config.categories.findIndex(
              (c) => c.id === cat.id
            );
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 border border-sky-deep rounded-sm p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCategoryUp(realIndex)}
                    disabled={displayIndex === 0}
                    className="p-1.5 -m-1.5 text-slate-muted hover:text-primary disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveCategoryDown(realIndex)}
                    disabled={displayIndex === sortedCategories.length - 1}
                    className="p-1.5 -m-1.5 text-slate-muted hover:text-primary disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) =>
                    updateCategory(realIndex, "name", e.target.value)
                  }
                  placeholder="Category name"
                  className={cn(inputClass, "flex-1")}
                />
                <button
                  onClick={() => removeCategory(realIndex)}
                  className="p-2 -m-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Items Section */}
      {renderSection(
        "items",
        "Menu Items",
        matchedItems.length,
        addItem,
        "Add Item",
        <>
          {sortedCategories.map((cat) => {
            const catItems = matchedItems
              .map((item) => ({ item, index: config.items.findIndex((i) => i.id === item.id) }))
              .filter(({ item }) => item.categoryId === cat.id);
            if (catItems.length === 0) return null;
            return renderCategoryGroup(cat, catItems);
          })}
          {/* Uncategorized items */}
          {matchedItems.filter(
            (item) =>
              !config.categories.some((c) => c.id === item.categoryId)
          ).length > 0 && (
            <div className="mb-3">
              <h3 className="text-slate-text text-sm font-bold mb-3">
                Uncategorized
              </h3>
              <div className="space-y-3">
                {matchedItems
                  .map((item) => ({ item, index: config.items.findIndex((i) => i.id === item.id) }))
                  .filter(
                    ({ item }) =>
                      !config.categories.some(
                        (c) => c.id === item.categoryId
                      )
                  )
                  .map(({ item, index }) => renderItemCard(item, index))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Popular Meals Section */}
      {renderSection(
        "presets",
        "Popular Meals",
        matchedPresets.length,
        addPresetMeal,
        "Add Meal",
        <div className="space-y-4">
          {matchedPresets.map((preset) => {
            const index = config.presetMeals.findIndex((pm) => pm.id === preset.id);
            return (
            <div
              key={preset.id}
              className="border border-sky-deep rounded-sm p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={preset.name}
                      onChange={(e) =>
                        updatePresetMeal(index, "name", e.target.value)
                      }
                      placeholder="Meal name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={preset.description}
                      onChange={(e) =>
                        updatePresetMeal(index, "description", e.target.value)
                      }
                      placeholder="Short description"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removePresetMeal(index)}
                  className="p-2 -m-2 text-red-400 hover:text-red-600 transition-colors mt-6"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <label className={labelClass}>Price / Person</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={preset.pricePerPerson}
                      onChange={(e) =>
                        updatePresetMeal(
                          index,
                          "pricePerPerson",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={cn(inputClass, "pl-7 w-full md:w-28")}
                    />
                  </div>
                </div>
                <div className="sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preset.isAvailable}
                      onChange={(e) =>
                        updatePresetMeal(
                          index,
                          "isAvailable",
                          e.target.checked
                        )
                      }
                      className="accent-primary w-5 h-5"
                    />
                    <span className="text-sm text-slate-text">Available</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Included Items</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-sky-deep rounded-sm p-3">
                  {sortedCategories.map((cat) => {
                    const catItems = config.items.filter(
                      (item) => item.categoryId === cat.id
                    );
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <p className="text-xs font-bold text-slate-muted uppercase tracking-wide mb-1">
                          {cat.name}
                        </p>
                        {catItems.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={preset.itemIds.includes(item.id)}
                              onChange={() =>
                                togglePresetItem(index, item.id)
                              }
                              className="accent-primary w-5 h-5"
                            />
                            <span className="text-sm text-slate-text">
                              {item.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t border-sky-deep py-4 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 size={16} /> Saved successfully
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} /> {saveError}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center justify-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Menu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
