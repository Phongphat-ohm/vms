import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition-shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
