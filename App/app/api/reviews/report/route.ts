// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

/**
 * @openapi
 * /api/report-review:
 *   post:
 *     summary: Report a review
 *     description: Allows an authenticated user to report a review. Sends details to Discord for moderation.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewId
 *               - reason
 *             properties:
 *               reviewId:
 *                 type: string
 *                 description: The ID of the review being reported.
 *               reason:
 *                 type: string
 *                 description: The reason why the review is being reported.
 *     responses:
 *       200:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report submitted
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Failed to process report
 */

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
