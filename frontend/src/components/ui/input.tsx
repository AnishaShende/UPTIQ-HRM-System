import * as React from "react"

import { cn } from "@/lib/utils"
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ElementType;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, leftIcon: Icon, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="relative">
          {Icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground">
              <Icon size={16} />
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              Icon ? "pl-8" : "pl-3",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input"

export { Input }
