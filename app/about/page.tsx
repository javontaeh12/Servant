import { HandHeart, Home, ChefHat, Sparkles } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { VALUES } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  HandHeart,
  Home,
  ChefHat,
  Sparkles,
};

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Who We Are
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Our Story
          </h1>
          <div className="animate-line-grow h-[2px] bg-primary mx-auto mt-6" style={{ animationDelay: "0.3s" }} />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image placeholder */}
          <div className="aspect-[4/5] bg-sky border border-sky-deep relative overflow-hidden rounded-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-primary/20 font-heading text-sm tracking-[0.3em] uppercase">
                Your Photo Here
              </p>
            </div>
          </div>

          {/* Story text */}
          <div>
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-4">
              Our Mission
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-text mb-8 leading-tight">
              Serving with{" "}
              <span className="text-primary italic">Purpose</span>
            </h2>
            <div className="space-y-5 text-slate-muted text-[15px] leading-[1.8]">
              <p>
                At I&apos;m A Servant First LLC, our name is our promise. Before
                we are caterers, before we are chefs, we are servants. Every
                dish we prepare and every table we set is an act of service —
                rooted in love, excellence, and the rich tradition of southern
                hospitality.
              </p>
              <p>
                Born from a deep passion for bringing people together around
                great food, our company was founded on the belief that catering
                is more than a meal — it&apos;s an experience. We draw from
                generations of southern cooking traditions, blending time-honored
                recipes with modern culinary artistry.
              </p>
              <p>
                Whether it&apos;s a wedding celebration, a corporate gathering,
                or a family reunion, we approach every event with the same heart:
                to serve first, and to serve excellently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-sky/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide every meal we prepare and every event we serve."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {VALUES.map((value) => {
              const Icon = ICON_MAP[value.icon] || Sparkles;
              return (
                <div key={value.title} className="bg-white border border-sky-deep/50 p-8 text-center h-full hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm">
                  <Icon
                    className="text-primary mx-auto mb-5"
                    size={28}
                    strokeWidth={1.5}
                  />
                  <h3 className="font-heading text-lg font-bold text-slate-text mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-muted text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
