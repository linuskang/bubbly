import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all bubblers, only the addedby field
    const bubblers = await prisma.bubbler.findMany({
      select: {
        addedby: true,
      },
    });

    // Create a unique list of contributors
    const contributors = Array.from(
      new Set(bubblers.map(b => b.addedby).filter(Boolean))
    );

    return NextResponse.json({
      total_water_fountains: bubblers.length,
      contributors,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
