import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth();
  const { id } = await params;

  const data = await prisma.cafepos_transaction.findUnique({
    where: { id },
    select: { id: true, nominal: true, status: true },
  });

  return NextResponse.json({ data });
}
