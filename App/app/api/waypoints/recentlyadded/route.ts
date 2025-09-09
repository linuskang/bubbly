// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0

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

        const recentBubblers = await prisma.bubbler.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                description: true,
                type: true,
                addedby: true,
                addedbyuserid: true,
                verified: true,
                isaccessible: true,
                dogfriendly: true,
                hasbottlefiller: true,
                imageUrl: true,
                maintainer: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(recentBubblers);
    } catch (error) {
        console.error("GET recently added bubblers error:", error);
        return new NextResponse("Failed to fetch recently added bubblers", { status: 500 });
    }
}