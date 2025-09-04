// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// curl -X POST https://waternearme.linus.id.au/api/user \
// -H "x-api-key: apikeyhere" \
// -H "Content-Type: application/json" \
// -d '{
//   "name": "Linus Kang",
//   "username": "linuskang",
//   "image": "https://example.com/avatar.png"
// }'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const apiKey = req.headers.get("x-api-key");
    let authenticated = false;

    if (apiKey && apiKey === process.env.API_KEY) {
      authenticated = true;
    }

    if (!authenticated && session?.user?.email) {
      authenticated = true;
    }

    if (!authenticated) {
      return new NextResponse(
        "403 Forbidden: Please sign in to access this resource.",
        { status: 403 }
      );
    }

    const { name, image, username } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse(
        "Account email not found",
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name ?? undefined,
        image: image ?? undefined,
        username: username ?? undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ERROR] An error occured:", error);
    return NextResponse.json(
      { error: "An error occured whilst updating user details. Please contact support." },
      { status: 500 }
    );
  }
}