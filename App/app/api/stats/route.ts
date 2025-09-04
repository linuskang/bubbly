// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalWaterFountains = await prisma.bubbler.count();
    
    const contributorsRaw = await prisma.bubbler.findMany({
      select: { addedby: true },
      where: { addedby: { not: null } },
      distinct: ["addedby"],
    });

    const contributors = contributorsRaw.map(c => c.addedby!);

    return NextResponse.json({
      total_water_fountains: totalWaterFountains,
      total_contributors: contributors.length,
      contributors,
    });
    
  } catch (err) {
    console.error("Stats fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
