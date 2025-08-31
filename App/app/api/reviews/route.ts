import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bubblerId = url.searchParams.get("bubblerId");
  if (!bubblerId) return new NextResponse("Missing bubblerId", { status: 400 });

  const id = parseInt(bubblerId, 10);
  if (isNaN(id)) return new NextResponse("Invalid bubblerId", { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { bubblerId: id },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { bubblerId, rating, comment } = body;

    if (!bubblerId || typeof rating !== "number") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bubblerId,
        userId: session.user.id,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to create review", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(request.url);
    const reviewId = url.searchParams.get("reviewId");
    if (!reviewId) return new NextResponse("Missing reviewId", { status: 400 });

    const id = parseInt(reviewId, 10);
    if (isNaN(id)) return new NextResponse("Invalid reviewId", { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return new NextResponse("Review not found", { status: 404 });
    if (review.userId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

    await prisma.review.delete({ where: { id } });
    return new NextResponse("Review deleted", { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to delete review", { status: 500 });
  }
}
