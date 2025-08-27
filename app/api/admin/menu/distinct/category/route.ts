import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.cafepos_menu_items.findMany({
    distinct: ["category"],
  });

  const category = data.map((d) => d.category).filter((i) => i !== null);

  return NextResponse.json({ data: category });
}
