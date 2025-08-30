import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const data = await prisma.cafepos_transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true },
        },
        transaction_menu_items: {
          include: { addon: true, variety: true, menu_items: true },
        },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const body: Prisma.cafepos_transactionUpdateInput = await req.json();
    await prisma.cafepos_transaction.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
