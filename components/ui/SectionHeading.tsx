import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("text-center mb-16 md:mb-20", className)}>
      <h2
        className={cn(
          "font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 animate-fade-up",
          light ? "text-white" : "text-slate-text"
        )}
      >
        {title}
      </h2>
      <div className="animate-line-grow h-[2px] bg-primary mx-auto mb-5" />
      {subtitle && (
        <p
          className={cn(
            "text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-2",
            light ? "text-white/60" : "text-slate-muted"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
