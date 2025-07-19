"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  CheckboxProps
>(({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    ref={ref}
    onClick={() => onCheckedChange?.(!checked)}
    disabled={disabled}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      "inline-flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
      checked 
        ? "bg-[#015965] border-[#015965] text-white" 
        : "bg-transparent border-[#015965] hover:bg-[#015965]/10",
      className
    )}
    data-state={checked ? "checked" : "unchecked"}
    {...props}
  >
    {checked && <Check className="h-3 w-3" />}
  </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox } 