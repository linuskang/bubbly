import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { name, image } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name ?? undefined,
        image: image ?? undefined,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
