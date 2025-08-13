import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bubblers = await prisma.bubbler.findMany();
  return NextResponse.json(bubblers);
}

// curl -X POST http://localhost:3000/api/waypoints \
//  -H "Content-Type: application/json" \
//  -d '{
//    "name": "Calamvale District Park Fountain",
//    "latitude": -27.621276,
//    "longitude": 153.038100,
//    "description": "Near the playground",
//    "addedby": "linus"
//  }'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST body:", body);

    const { name, latitude, longitude, description, addedby } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      console.error("Latitude or longitude invalid:", latitude, longitude);
      return new NextResponse("Latitude and longitude must be numbers", { status: 400 });
    }
    if (!addedby) {
      console.error("Missing addedby");
      return new NextResponse("Missing addedby", { status: 400 });
    }

    const newBubbler = await prisma.bubbler.create({
      data: { name, latitude, longitude, description, addedby },
    });

    return NextResponse.json(newBubbler);
  } catch (error) {
    console.error("POST error:", error);
    return new NextResponse("Invalid data", { status: 400 });
  }
}

// curl -X DELETE "https://example.com/api/bubblers?id=123"

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return new NextResponse("Missing id parameter", { status: 400 });
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return new NextResponse("Invalid id parameter", { status: 400 });
    }

    // Delete the bubbler by id
    await prisma.bubbler.delete({
      where: { id },
    });

    return new NextResponse(`Deleted bubbler with id ${id}`, { status: 200 });
  } catch (error) {
    return new NextResponse("Error deleting bubbler", { status: 500 });
  }
}