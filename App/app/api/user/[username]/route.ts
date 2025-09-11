// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/user/{username}:
 *   get:
 *     summary: Get user profile
 *     description: Returns user profile information, reviews submitted, and water fountains added by the user. Requires authentication via API key or session.
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to fetch.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 reviewCount:
 *                   type: integer
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       rating:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       bubblerId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 bubblersAddedCount:
 *                   type: integer
 *                 bubblersAdded:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *                       addedbyuserid:
 *                         type: string
 *       403:
 *         description: Forbidden — invalid API key or session required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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
        bio: true,
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
