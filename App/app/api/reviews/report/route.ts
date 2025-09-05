// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { reviewId, reason } = body;

    if (!reviewId || !reason) {
      return new NextResponse("Missing reviewId or reason", { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return new NextResponse("Review not found", { status: 404 });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `Review reported by ${session.user.id}`,
      embeds: [
        {
          title: "Review Report Submitted",
          fields: [
            { name: "Review ID", value: String(reviewId), inline: true },
            { name: "Reporter ID", value: session.user.id, inline: true },
            { name: "Reason", value: reason },
            { name: "Review Comment", value: review.comment || "No comment" },
            { name: "Bubbler ID", value: String(review.bubblerId), inline: true },
          ],
          color: 0xffa500,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json({ message: "Report submitted" });
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to report review", { status: 500 });
  }
}
