import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (!userId && !username) {
        return NextResponse.json({ error: "userId or username required" }, { status: 400 });
    }

    let user;
    if (userId) {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
        });
    } else if (username) {
        user = await prisma.user.findUnique({
            where: { username },
            select: { xp: true, level: true },
        });
    }

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}