import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDiscordWebhook } from "@/lib/discord";

// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/users/{username}/report:
 *   post:
 *     summary: Report a user
 *     description: Allows an authenticated user to report another user. Sends report details to Discord.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user being reported.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: The reason for reporting the user.
 *     responses:
 *       200:
 *         description: User reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing reason or invalid request (e.g., reporting self)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reported user not found
 *       500:
 *         description: Failed to report user
 */

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { reason } = await request.json();
    if (!reason?.trim()) return new NextResponse("Missing reason", { status: 400 });

    const { username } = params;
    if (username === session.user.username) return new NextResponse("You cannot report yourself", { status: 400 });

    const reportedUser = await prisma.user.findUnique({ where: { username } });
    if (!reportedUser) return new NextResponse("User not found", { status: 404 });

    await sendDiscordWebhook(webhookUrl, {
      username: "WaterNearMe Reports",
      content: `A user report has been submitted!`,
      embeds: [
        {
          title: "User Report",
          color: 0xffa500,
          fields: [
            { name: "Reporter User ID", value: session.user.id, inline: true },
            { name: "Reported User ID", value: reportedUser.id, inline: true },
            { name: "Reason", value: reason },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[USER REPORT ERROR]", error);
    return new NextResponse("Failed to report user", { status: 500 });
  }
}
