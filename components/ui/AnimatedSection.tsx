import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className,
}: AnimatedSectionProps) {
  return <div className={cn(className)}>{children}</div>;
}
