// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get site statistics
 *     description: Returns the total number of water fountains, contributors, users, reviews, and audit log entries.
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
 *                 total_contributors:
 *                   type: integer
 *                 contributors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 total_users:
 *                   type: integer
 *                 total_reviews:
 *                   type: integer
 *                 total_audit_log_entries:
 *                   type: integer
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

    const totalUsers = await prisma.user.count();
    const totalReviews = await prisma.review.count();
    const totalAuditLogEntries = await prisma.bubblerAuditLog.count();

    return NextResponse.json({
      total_water_fountains: totalWaterFountains,
      total_contributors: contributors.length,
      contributors,
      total_users: totalUsers,
      total_reviews: totalReviews,
      total_audit_log_entries: totalAuditLogEntries,
    });

  } catch (err) {
    console.error("Stats fetch error:", err);
    return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
    );
  }
}