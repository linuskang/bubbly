"use client"

import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command"

interface CommandDeckProps {
  isOpen: boolean
  onClose: () => void
  onAction?: (action: string) => void
}

const actions = ["Add a water fountain", "Edit info", "Add a review", "Report an issue"]

export default function CommandDeck({ isOpen, onClose, onAction }: CommandDeckProps) {
  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Contribute to WaterNearMe"
      description="Choose an action to help improve the water fountain database"
    >
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandGroup
          heading={
            <span>
              What would you like to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                contribute
              </span>
              ?
            </span>
          }
        >
          {actions.map((action) => (
            <CommandItem
              key={action}
              onSelect={() => {
                onAction?.(action)
                onClose()
              }}
            >
              {action}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}