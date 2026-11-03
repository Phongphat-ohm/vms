import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      Boolean(checked ?? props.defaultChecked ?? false)
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = e.target.checked;
      if (checked === undefined) {
        setIsChecked(nextVal);
      }
      onChange?.(e);
      onCheckedChange?.(nextVal);
    };

    return (
      <label
        className={cn(
          "relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-slate-300 bg-white transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        >
          {isChecked && <Check className="h-3 w-3 text-white stroke-[3]" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
