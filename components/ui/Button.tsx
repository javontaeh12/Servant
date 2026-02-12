"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-heading font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer inline-flex items-center justify-center",
          variant === "primary" &&
            "bg-gold text-jet hover:bg-gold-light active:bg-gold-dark hover:scale-[1.02]",
          variant === "outline" &&
            "border-2 border-gold text-gold hover:bg-gold hover:text-jet",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
