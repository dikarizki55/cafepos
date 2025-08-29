import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { cafepos_transaction_status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ status: cafepos_transaction_status }> }
) {
  const { status } = await params;
  await requireAuth();

  const data = await prisma.cafepos_transaction.findMany({
    where: { status },
    select: {
      id: true,
      table: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: { transaction_menu_items: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({
    data: data.map((v) => ({ ...v, items: v._count.transaction_menu_items })),
  });
}
