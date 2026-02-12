import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  goldBorder?: boolean;
}

export default function Card({
  children,
  className,
  goldBorder = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-charcoal/50 backdrop-blur-sm rounded-lg p-6",
        goldBorder && "border-t-2 border-gold",
        "hover:bg-charcoal/70 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
