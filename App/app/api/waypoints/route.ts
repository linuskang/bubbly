// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordWebhook } from "@/lib/discord";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

/**
 * @openapi
 * /api/waypoints:
 *   get:
 *     summary: Get waypoints
 *     description: Returns a list of water fountains (bubblers). Supports filtering by ID or name.
 *     parameters:
 *       - in: query
 *         name: bubblerId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Return a single bubbler with this ID.
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Search for bubblers containing this name (case-insensitive).
 *     responses:
 *       200:
 *         description: List of matching waypoints
 *       404:
 *         description: No bubblers found for the given query
 *       500:
 *         description: Failed to fetch bubblers
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
 *               imageUrl:
 *                 type: string
 *               maintainer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Waypoint created successfully
 *       400:
 *         description: Invalid data or missing required fields
 *       401:
 *         description: Unauthorized — API key or session required
 *
 *   patch:
 *     summary: Edit a waypoint
 *     description: Partially updates a bubbler's information. Only include fields to change. Requires authentication (session or API key).
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the waypoint to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               verified:
 *                 type: boolean
 *               isaccessible:
 *                 type: boolean
 *               dogfriendly:
 *                 type: boolean
 *               hasbottlefiller:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               maintainer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Waypoint updated successfully
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Unauthorized — API key or session required
 *       500:
 *         description: Failed to update waypoint
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bubblerIdParam = url.searchParams.get("bubblerId");
    const nameParam = url.searchParams.get("name");

    if (bubblerIdParam) {
      const id = parseInt(bubblerIdParam, 10);
      if (isNaN(id)) {
        return new NextResponse("Invalid bubblerId parameter", { status: 400 });
      }

      const bubbler = await prisma.bubbler.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          description: true,
          type: true,
          addedby: true,
          addedbyuserid: true,
          verified: true,
          isaccessible: true,
          dogfriendly: true,
          hasbottlefiller: true,
          imageUrl: true,
          maintainer: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!bubbler) {
        return new NextResponse(`No bubbler found with id ${id}`, { status: 404 });
      }

      return NextResponse.json(bubbler);
    }

    if (nameParam) {
      const bubblers = await prisma.bubbler.findMany({
        where: {
          name: {
            contains: nameParam,
          },
        },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          description: true,
          type: true,
          addedby: true,
          addedbyuserid: true,
          verified: true,
          isaccessible: true,
          dogfriendly: true,
          hasbottlefiller: true,
          imageUrl: true,
          maintainer: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (bubblers.length === 0) {
        return new NextResponse(`No bubblers found with name containing "${nameParam}"`, { status: 404 });
      }

      return NextResponse.json(bubblers);
    }

    const bubblers = await prisma.bubbler.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        description: true,
        type: true,
        addedby: true,
        addedbyuserid: true,
        verified: true,
        isaccessible: true,
        dogfriendly: true,
        hasbottlefiller: true,
        imageUrl: true,
        maintainer: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(bubblers);
  } catch (error) {
    console.error("GET bubblers error:", error);
    return new NextResponse("Failed to fetch bubblers", { status: 500 });
  }
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
//    "type": "fountain",
//    "maintainer": "Brisbane City Council",
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
      maintainer,
      imageUrl,
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
        maintainer,
        imageUrl,
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
            { name: "Accessible", value: isaccessible.toString(), inline: true },
            { name: "Description", value: description || "N/A" },
            { name: "Maintainer", value: maintainer || "N/A" },
            { name: "Image URL", value: imageUrl || "N/A" },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    await prisma.bubblerAuditLog.create({
      data: {
        bubblerId: newBubbler.id,
        userId: finalUserId,
        action: "CREATE",
        changes: newBubbler, // entire object on creation
      },
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

// curl -X PATCH "https://your-domain/api/waypoints?id=123" \
// -H "Content-Type: application/json" \
// -H "x-api-key: your_api_key_here" \
// -d '{
//   "name": "Updated Fountain Name",
//   "description": "Updated description for this bubbler",
//   "imageUrl": "https://example.com/new-image.jpg"
// }'


export async function PATCH(request: NextRequest, context: {params: any}) {
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

    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return new NextResponse("Missing id parameter", { status: 400 });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return new NextResponse("Invalid id parameter", { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      latitude,
      longitude,
      description,
      type,
      isaccessible,
      dogfriendly,
      hasbottlefiller,
      imageUrl,
      maintainer,
    } = body;

    const oldBubbler = await prisma.bubbler.findUnique({ where: { id } });

    if (!oldBubbler) {
      return new NextResponse("failed to find bubbler.", {status: 404});
    }

    const dataToUpdate: any = {};
    if (name !== undefined && name !== oldBubbler.name) dataToUpdate.name = name;
    if (latitude !== undefined && latitude !== oldBubbler.latitude) dataToUpdate.latitude = latitude;
    if (longitude !== undefined && longitude !== oldBubbler.longitude) dataToUpdate.longitude = longitude;
    if (description !== undefined && description !== oldBubbler.description) dataToUpdate.description = description;
    if (type !== undefined && type !== oldBubbler.type) dataToUpdate.type = type;
    if (isaccessible !== undefined && isaccessible !== oldBubbler.isaccessible) dataToUpdate.isaccessible = isaccessible;
    if (dogfriendly !== undefined && dogfriendly !== oldBubbler.dogfriendly) dataToUpdate.dogfriendly = dogfriendly;
    if (hasbottlefiller !== undefined && hasbottlefiller !== oldBubbler.hasbottlefiller) dataToUpdate.hasbottlefiller = hasbottlefiller;
    if (imageUrl !== undefined && imageUrl !== oldBubbler.imageUrl) dataToUpdate.imageUrl = imageUrl;
    if (maintainer !== undefined && maintainer !== oldBubbler.maintainer) dataToUpdate.maintainer = maintainer;

    if (Object.keys(dataToUpdate).length === 0) {
      return new NextResponse("No changes detected", { status: 400 });
    }

    const updatedBubbler = await prisma.bubbler.update({
      where: { id },
      data: dataToUpdate,
    });

    const changes: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(dataToUpdate)) {
      changes[key] = { old: (oldBubbler as any)[key], new: (updatedBubbler as any)[key] };
    }

    // Save audit log
    await prisma.bubblerAuditLog.create({
      data: {
        bubblerId: id,
        userId: userId || null,
        action: "UPDATE",
        changes,
      },
    });

    await sendDiscordWebhook(webhookUrl, {
      username: "Bubbly",
      content: `A bubbler was updated: ${updatedBubbler.name}`,
      embeds: [
        {
          title: "Bubbler Updated",
          color: 0x00ccff,
          fields: [
            { name: "ID", value: updatedBubbler.id.toString(), inline: true },
            { name: "Name", value: updatedBubbler.name, inline: true },
            { name: "Image URL", value: updatedBubbler.imageUrl || "N/A", inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json(updatedBubbler);
  } catch (error) {
    console.error("PATCH error:", error);
    return new NextResponse("Failed to update bubbler", { status: 500 });
  }
}