// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/user:
 *   post:
 *     summary: Update authenticated user profile
 *     description: Allows an authenticated user (via session or API key) to update their name, username, and profile image. Sends an update notification to Discord.
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new display name for the user.
 *               username:
 *                 type: string
 *                 description: The new username for the user.
 *                bio:
               *   type: string
               *   description: The biography text for the user.
 *               image:
 *                 type: string
 *                 description: URL of the new profile image.
 *     responses:
 *       200:
 *         description: User profile updated successfully
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
 *       403:
 *         description: Forbidden — invalid API key or session required
 *       500:
 *         description: Failed to update user profile
 */

// curl -X POST https://waternearme.linus.id.au/api/user \
// -H "x-api-key: apikeyhere" \
// -H "Content-Type: application/json" \
// -d '{
//   "name": "Linus Kang",
//   "username": "linuskang",
//   "bio": "Hello world",
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

    const { name, image, username, bio } = await req.json();

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
        bio: bio ?? undefined,
      },
    });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `User profile updated: ${session.user.email}`,
      embeds: [
        {
          title: "Profile Updated",
          color: 0x00ffcc,
          fields: [
            { name: "Email", value: session.user.email, inline: true },
            { name: "Name", value: name ?? "No change", inline: true },
            { name: "Username", value: username ?? "No change", inline: true },
            { name: "Bio", value: bio ?? "No change" },
            { name: "Image URL", value: image ?? "No change" },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
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