// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    await prisma.bubbler.delete({
      where: { id },
    });

    return new NextResponse(`Deleted bubbler with id ${id}`, { status: 200 });
  } catch (error) {
    return new NextResponse("An error occured whilst deleting bubbler. Please contact support.", { status: 500 });
  }
}