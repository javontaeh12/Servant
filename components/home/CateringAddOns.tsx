import {
  ConciergeBell,
  Users,
  ChefHat,
  Utensils,
  Wine,
  Flame,
} from "lucide-react";

const ADD_ONS = [
  {
    name: "Buffet Style",
    description:
      "A generous spread where guests serve themselves from beautifully arranged stations featuring our signature southern dishes.",
    icon: ChefHat,
  },
  {
    name: "Family Style",
    description:
      "Platters served directly to your table so guests can share and pass dishes — just like Sunday dinner at home.",
    icon: Users,
  },
  {
    name: "Table & Waiter Service",
    description:
      "Full-service plated dining with dedicated waitstaff for an elevated, fine-dining experience at your event.",
    icon: ConciergeBell,
  },
  {
    name: "Cocktail Hour Bites",
    description:
      "Passed hors d'oeuvres and small bites perfect for mingling — a sophisticated start to any celebration.",
    icon: Wine,
  },
  {
    name: "Carving & Live Stations",
    description:
      "Interactive chef-attended stations featuring carved meats, made-to-order sides, and live cooking displays.",
    icon: Flame,
  },
  {
    name: "Custom Plating",
    description:
      "Individually plated courses designed and presented with artful attention to detail for an upscale touch.",
    icon: Utensils,
  },
];

export default function CateringAddOns() {
  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-sky/50">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-primary text-xs tracking-[0.35em] uppercase mb-4">
            Catering Options and Add-Ons
          </p>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            What We Offer
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            Customize your event with our flexible service styles — from casual
            buffets to full white-glove dining.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {ADD_ONS.map((addon) => (
            <div
              key={addon.name}
              className="group relative bg-white border border-sky-deep/50 p-8 lg:p-10 hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <addon.icon
                className="text-primary mb-6"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text mb-3">
                {addon.name}
              </h3>
              <p className="text-slate-muted text-sm leading-relaxed">
                {addon.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
