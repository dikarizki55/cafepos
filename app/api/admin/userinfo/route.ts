import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: {
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
    },
  });

  return NextResponse.json({ user });
}
