// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/waypoints:
 *   get:
 *     summary: Get all waypoints
 *     description: Returns a list of all water fountains (bubblers) in the database.
 *     responses:
 *       200:
 *         description: List of waypoints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   description:
 *                     type: string
 *                   type:
 *                     type: string
 *                   addedby:
 *                     type: string
 *                   addedbyuserid:
 *                     type: string
 *                   verified:
 *                     type: boolean
 *                   isaccessible:
 *                     type: boolean
 *                   dogfriendly:
 *                     type: boolean
 *                   hasbottlefiller:
 *                     type: boolean
 *
 *   post:
 *     summary: Create a new waypoint
 *     description: Creates a new water fountain entry. Requires authentication (session or API key).
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - latitude
 *               - longitude
 *               - type
 *               - addedbyuserid
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               addedby:
 *                 type: string
 *               addedbyuserid:
 *                 type: string
 *               verified:
 *                 type: boolean
 *               isaccessible:
 *                 type: boolean
 *               dogfriendly:
 *                 type: boolean
 *               hasbottlefiller:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Waypoint created successfully
 *       400:
 *         description: Invalid data or missing required fields
 *       401:
 *         description: Unauthorized — API key or session required
 *
 *   delete:
 *     summary: Delete a waypoint
 *     description: Deletes a waypoint by ID. Requires API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the waypoint to delete
 *     responses:
 *       200:
 *         description: Waypoint deleted successfully
 *       400:
 *         description: Missing or invalid id parameter
 *       401:
 *         description: Unauthorized — API key required
 *       500:
 *         description: Failed to delete waypoint
 */

// Waypoints API
// GET: Get all waypoints
// POST: Create a new waypoint (requires authentication or API key)
// DELETE: Delete a waypoint (requires API key)

export async function GET() {
  const bubblers = await prisma.bubbler.findMany();
  return NextResponse.json(bubblers);
}

// curl -X POST https://waternearme.linus.id.au/api/waypoints \
//  -H "Content-Type: application/json" \
//  -H "x-api-key: your_api_key_here" \
//  -d '{
//    "name": "Calamvale District Park Fountain",
//    "latitude": -27.621276,
//    "longitude": 153.038100,
//    "description": "Near the playground",
//    "addedbyuserid": "cmeyw9hza0003d95tjg8h2zki",
//    "verified": false,
//    "isaccessible": true,
//    "dogfriendly": true,
//    "hasbottlefiller": false,
//    "addedby": "linus",
//    "type": "fountain"
//  }'

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    let authorized = false;
    let userId: string | null = null;

    if (apiKey && apiKey === process.env.API_KEY) {
      authorized = true;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        authorized = true;
        userId = session.user.id;
      }
    }

    if (!authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("POST body:", body);

    const {
      name,
      latitude,
      longitude,
      description,
      addedby,
      type,
      addedbyuserid,
      verified = false,
      isaccessible = false,
      dogfriendly = false,
      hasbottlefiller = false,
    } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return new NextResponse("Latitude and longitude must be numbers", { status: 400 });
    }
    if (!name || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const finalUserId = userId || addedbyuserid;
    if (!finalUserId) {
      return new NextResponse("Missing addedbyuserid or session user", { status: 400 });
    }

    const newBubbler = await prisma.bubbler.create({
      data: {
        name,
        latitude,
        longitude,
        description,
        addedby,
        type,
        addedbyuserid: finalUserId,
        verified,
        isaccessible,
        dogfriendly,
        hasbottlefiller,
      },
    });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `A new bubbler was added: ${name}`,
      embeds: [
        {
          title: "New Bubbler Added",
          color: 0x00ffcc,
          fields: [
            { name: "Name", value: name, inline: true },
            { name: "Type", value: type, inline: true },
            { name: "Added By User ID", value: finalUserId, inline: true },
            { name: "Coordinates", value: `${latitude}, ${longitude}` },
            { name: "Verified", value: verified.toString(), inline: true },
            { name: "Dog Friendly", value: dogfriendly.toString(), inline: true },
            { name: "Bottle Filler", value: hasbottlefiller.toString(), inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json(newBubbler);
  } catch (error) {
    console.error("POST error:", error);
    return new NextResponse("Invalid data", { status: 400 });
  }
}

// curl -X DELETE "https://waternearme.linus.id.au/api/waypoints?id=2939" \ 
// -H "x-api-key: your_api_key_here"

export async function DELETE(request: Request) {
  try {

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return new NextResponse("Missing id parameter", { status: 400 });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return new NextResponse("Invalid id parameter", { status: 400 });
    }

    const deletedBubbler = await prisma.bubbler.delete({
      where: { id },
    });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `A bubbler was deleted: ${deletedBubbler.name}`,
      embeds: [
        {
          title: "Bubbler Deleted",
          color: 0xff4444,
          fields: [
            { name: "ID", value: id.toString(), inline: true },
            { name: "Name", value: deletedBubbler.name, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return new NextResponse(`Deleted bubbler with id ${id}`, { status: 200 });
  } catch (error) {
    return new NextResponse("An error occured whilst deleting bubbler. Please contact support.", { status: 500 });
  }
}