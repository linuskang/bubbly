// © 2025 Linus Kang
// Licensed under CC BY-NC-SA 4.0

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @openapi
 * /api/bubbler-logs:
 *   get:
 *     summary: Get audit logs for a specific bubbler
 *     description: Returns a list of audit log entries for the specified bubbler. Requires API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: bubblerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the bubbler to fetch logs for
 *     responses:
 *       200:
 *         description: List of audit log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   bubblerId:
 *                     type: integer
 *                   userId:
 *                     type: string
 *                   action:
 *                     type: string
 *                   changes:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Missing or invalid bubblerId parameter
 *       401:
 *         description: Unauthorized — API key required
 *       500:
 *         description: Failed to fetch logs
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bubblerIdParam = url.searchParams.get("bubblerId");

    if (!bubblerIdParam) {
      return new NextResponse("Missing bubblerId parameter", { status: 400 });
    }

    const bubblerId = parseInt(bubblerIdParam, 10);
    if (isNaN(bubblerId)) {
      return new NextResponse("Invalid bubblerId parameter", { status: 400 });
    }

    const logs = await prisma.bubblerAuditLog.findMany({
      where: { bubblerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET bubbler logs error:", error);
    return new NextResponse("Failed to fetch logs", { status: 500 });
  }
}