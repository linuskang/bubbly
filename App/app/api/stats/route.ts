// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get site statistics
 *     description: Returns the total number of water fountains and contributors.
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_water_fountains:
 *                   type: integer
 *                   description: Total number of water fountains in the database
 *                 total_contributors:
 *                   type: integer
 *                   description: Total number of unique contributors
 *                 contributors:
 *                   type: array
 *                   description: List of contributor usernames
 *                   items:
 *                     type: string
 *       500:
 *         description: Failed to fetch stats
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalWaterFountains = await prisma.bubbler.count();
    
    const contributorsRaw: { addedby: string | null }[] = await prisma.bubbler.findMany({
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
