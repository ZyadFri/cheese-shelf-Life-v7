"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("w-full", className)} {...props} />
}

function CollapsibleTrigger({ className, children, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group/collapsible-trigger inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted-foreground",
        "transition-colors duration-140 outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-3.5 shrink-0 transition-transform duration-200 group-data-[panel-open]/collapsible-trigger:rotate-180" />
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsiblePanel({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        className
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel }
