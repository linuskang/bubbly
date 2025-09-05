// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

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
