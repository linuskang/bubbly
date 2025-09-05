// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/waypoint/report:
 *   post:
 *     summary: Report a waypoint
 *     description: Allows an authenticated user to report a waypoint. Sends report details to Discord for moderation.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - waypointId
 *               - reason
 *             properties:
 *               waypointId:
 *                 type: string
 *                 description: The ID of the waypoint being reported.
 *               reason:
 *                 type: string
 *                 description: Reason for reporting the waypoint.
 *     responses:
 *       200:
 *         description: Waypoint reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Waypoint reported successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized — user must be logged in
 *       500:
 *         description: Failed to report waypoint
 */

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { waypointId, reason } = body;

    if (!waypointId || !reason) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Send to Discord
    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `Waypoint reported by user ${session.user.id}`,
      embeds: [
        {
          title: "Waypoint Reported",
          color: 0xffa500,
          fields: [
            { name: "Waypoint ID", value: String(waypointId), inline: true },
            { name: "Reported By", value: session.user.id, inline: true },
            { name: "Reason", value: reason },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json({ message: "Waypoint reported successfully" });
  } catch (err) {
    console.error("Waypoint report error:", err);
    return new NextResponse("Failed to report waypoint", { status: 500 });
  }
}
