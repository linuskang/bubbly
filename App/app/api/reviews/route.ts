// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

// Reviews API
// GET: Get reviews for a bubbler
// POST: Create a new review (requires authentication)
// DELETE: Delete a review (requires authentication or API key)

// curl -X GET "https://waternearme.linus.id.au/api/reviews?bubblerId=123"

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bubblerId = url.searchParams.get("bubblerId");
  if (!bubblerId) return new NextResponse("Missing bubblerId", { status: 400 });

  const id = parseInt(bubblerId, 10);
  if (isNaN(id)) return new NextResponse("Invalid bubblerId", { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { bubblerId: id },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// curl -X POST "https://waternearme.linus.id.au/api/reviews" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "bubblerId": 123,
//     "rating": 4.5,
//     "comment": "Great fountain, very clean!"
//   }'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { bubblerId, rating, comment } = body;

    if (!bubblerId || typeof rating !== "number") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bubblerId,
        userId: session.user.id,
        rating,
        comment,
      },
    });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `New review by ${session.user.id}`,
      embeds: [
        {
          title: "New Review Submitted",
          fields: [
            { name: "Bubbler ID", value: String(bubblerId), inline: true },
            { name: "Rating", value: String(rating), inline: true },
            { name: "Comment", value: comment || "No comment" },
          ],
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to create review", { status: 500 });
  }
}

// curl -X DELETE "https://waternearme.linus.id.au/api/reviews?reviewId=456" \
//   -H "x-api-key: your_api_key_here"

export async function DELETE(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    let authorized = false;
    let sessionUserId: string | null = null;

    if (apiKey && apiKey === process.env.API_KEY) {
      authorized = true;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        authorized = true;
        sessionUserId = session.user.id;
      }
    }

    if (!authorized) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const reviewIdParam = url.searchParams.get("reviewId");
    if (!reviewIdParam) return new NextResponse("Missing reviewId parameter", { status: 400 });

    const reviewId = parseInt(reviewIdParam, 10);
    if (isNaN(reviewId)) return new NextResponse("Invalid reviewId parameter", { status: 400 });

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return new NextResponse("Review not found", { status: 404 });

    if (sessionUserId && review.userId !== sessionUserId) {
      return new NextResponse("Forbidden: you can only delete your own reviews", { status: 403 });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `Review deleted by ${sessionUserId || "API Key"}`,
      embeds: [
        {
          title: "Review Deleted",
          fields: [
            { name: "Review ID", value: String(reviewId), inline: true },
            { name: "Bubbler ID", value: String(review.bubblerId), inline: true },
            { name: "User ID", value: review.userId, inline: true },
            { name: "Comment", value: review.comment || "No comment" },
          ],
          color: 0xff0000,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json({ message: `Deleted review ${reviewId}` });
  } catch (err) {
    console.error(err);
    return new NextResponse("An error occured whilst deleting review. Please contact support.", { status: 500 });
  }
}