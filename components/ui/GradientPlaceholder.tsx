import { cn } from "@/lib/utils";

interface GradientPlaceholderProps {
  variant?: "hero" | "service" | "about" | "square";
  className?: string;
}

export default function GradientPlaceholder({
  variant = "hero",
  className,
}: GradientPlaceholderProps) {
  const variants = {
    hero: "bg-gradient-to-br from-jet via-charcoal to-gold/20 min-h-[60vh]",
    service: "bg-gradient-to-b from-gold/10 via-charcoal to-jet aspect-video",
    about: "bg-gradient-to-br from-gold/20 via-charcoal to-jet aspect-square rounded-lg",
    square: "bg-gradient-to-br from-charcoal to-gold/10 aspect-square rounded-lg",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variants[variant],
        className
      )}
    >
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
