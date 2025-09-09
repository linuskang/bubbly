// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const numberParam = url.searchParams.get("number");
        const limit = numberParam ? parseInt(numberParam, 10) : 10;

        if (isNaN(limit) || limit <= 0) {
            return new NextResponse("Invalid number parameter", { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { username: true } }, bubbler: { select: { name: true } } },
        });

        return NextResponse.json(reviews);
    } catch (err) {
        console.error("Failed to fetch recent reviews:", err);
        return new NextResponse("Failed to fetch recent reviews", { status: 500 });
    }
}
