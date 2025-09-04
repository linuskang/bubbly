// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Props {
  params: any;
}

// curl -H "x-api-key: YOUR_API_KEY" https://waternearme.linus.id.au/api/user/linuskang

export async function GET(
  req: Request,
  { params }: Props,
) {
  const { username } = params;
  const apiKey = req.headers.get("x-api-key");
  let authenticated = false;

  if (apiKey && apiKey === process.env.API_KEY) {
    authenticated = true;
  }

  if (!authenticated) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      authenticated = true;
    }
  }

  if (!authenticated) {
    return new NextResponse("403 Forbidden: Please sign in to access this resource.", { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        bubblerId: true,
      },
    });

    const bubblersAdded = await prisma.bubbler.findMany({
      where: { addedbyuserid: user.id },
    });

    return NextResponse.json({
      ...user,
      reviewCount: reviews.length,
      reviews,
      bubblersAddedCount: bubblersAdded.length,
      bubblersAdded,
    });
  } catch (error) {
    console.error("[ERROR] An error occured:", error);
    return NextResponse.json({ error: "An error occured whilst fetching user data. Please contact support." }, { status: 500 });
  }
}
