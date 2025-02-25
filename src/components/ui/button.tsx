import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          
          // Variant styles
          {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "default",
            "border border-gray-700 bg-transparent hover:bg-gray-800/50": variant === "outline",
            "hover:bg-gray-800/50": variant === "ghost",
            "text-blue-500 hover:underline": variant === "link",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          },

          // Size styles
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3": size === "sm",
            "h-11 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
