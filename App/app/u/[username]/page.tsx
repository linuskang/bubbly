// app/user/[username]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface PageProps {
  params: { username: string }
}

export default async function UserProfilePage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true, username: true, image: true, createdAt: true },
  })

  if (!user) return notFound()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{user.name?.[0] || user.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-semibold">{user.name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Optional: Add user’s reviews, favorites, or other info here */}
    </div>
  )
}
