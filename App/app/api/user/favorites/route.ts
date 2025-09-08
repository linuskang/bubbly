import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API for managing user favorites
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorites of the logged-in user
 *     tags: [Favorites]
 *     responses:
 *       200:
 *         description: List of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: { bubbler: true },
    });

    return NextResponse.json(favorites);
}

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a new favorite
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bubblerId:
 *                 type: integer
 *                 description: ID of the bubbler to favorite
 *             required:
 *               - bubblerId
 *     responses:
 *       201:
 *         description: Favorite created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bubblerId } = await req.json();
    if (!bubblerId) return NextResponse.json({ error: "bubblerId is required" }, { status: 400 });

    const favorite = await prisma.favorite.create({
        data: { userId: session.user.id, bubblerId },
    });

    return NextResponse.json(favorite, { status: 201 });
}

/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: Delete a favorite by ID
 *     tags: [Favorites]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the favorite to delete
 *     responses:
 *       200:
 *         description: Number of deleted favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: integer
 *       400:
 *         description: Favorite ID required
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const favoriteId = searchParams.get("id");
    if (!favoriteId) return NextResponse.json({ error: "Favorite id is required" }, { status: 400 });

    const favorite = await prisma.favorite.deleteMany({
        where: { id: Number(favoriteId), userId: session.user.id },
    });

    return NextResponse.json({ deleted: favorite.count });
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: string
 *         bubblerId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         bubbler:
 *           type: object
 *           description: The associated bubbler object
 */
