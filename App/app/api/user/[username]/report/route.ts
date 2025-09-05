import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(request: Request, { params }: { params: { username: string } }) {
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
