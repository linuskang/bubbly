"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"

interface UserAvatarDropdownProps {
  session: any
  onSettingsClick?: () => void
}

export default function UserAvatarDropdown({ session, onSettingsClick }: UserAvatarDropdownProps) {
  const router = useRouter()

  if (!session) return null

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
            <Avatar className="w-9 h-9 ring-2 ring-border hover:ring-primary/20 transition-all duration-200">
              <AvatarImage
                  src={session.user?.image}
                  alt={session.user?.name || "User"}
                  className="object-cover"
              />
              <AvatarFallback className="bg-blue-500 from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
            align="end"
            className="w-56 p-2 shadow-lg border bg-popover/95 backdrop-blur-sm"
            sideOffset={8}
        >
          <DropdownMenuLabel className="px-3 py-2 text-sm">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-foreground">{session.user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
              onClick={() => {
                if (session.user?.username) {
                  router.push(`/user/${session.user.username}`)
                }
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
              onClick={() => onSettingsClick?.()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive hover:text-destructive focus:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
