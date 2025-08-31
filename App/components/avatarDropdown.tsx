import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UserAvatarDropdownProps {
  session: any
  onSettingsClick?: () => void
}

export default function UserAvatarDropdown({ session, onSettingsClick }: UserAvatarDropdownProps) {
  if (!session) return null
    const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-10 h-10 rounded-full shadow cursor-pointer">
          <AvatarImage src={session.user?.image} alt={session.user?.name || "User"} />
          <AvatarFallback className="text-base font-bold">
            {session.user?.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => {
            if (session.user?.username) {
              router.push(`/u/${session.user.username}`)
            }
          }}
        >
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onSettingsClick?.()}>
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
