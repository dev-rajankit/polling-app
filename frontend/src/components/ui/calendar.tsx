"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background p-3",
        className
      )}
      classNames={{
        nav_button_previous: cn(buttonVariants({ variant: "ghost" })),
        nav_button_next: cn(buttonVariants({ variant: "ghost" })),
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
