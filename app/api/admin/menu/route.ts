import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.cafepos_menu_items.findMany({
    include: {
      addons: true,
      variety: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  await requireAuth();

  const res = await req.formData();
  const name = res.get("name") as string;
  const price = res.get("price") as string;
  const category = res.get("category") as string;
  const addons: { name: string; level: string; price: string }[] = JSON.parse(
    String(res.get("addons"))
  );
  const variations: { name: string; price: string }[] = JSON.parse(
    String(res.get("variations"))
  );

  // validation price
  if (
    Number(price) < 0 ||
    addons.some((a) => Number(a.price) < 0) ||
    variations.some((v) => Number(v.price) < 0)
  )
    return NextResponse.json(
      { message: "error, price min 0" },
      { status: 400 }
    );

  const image = res.get("image") as File;

  if (image) {
    const bucket = "cafepos"; //foldername

    const filename = `${name}-${Date.now()}-${image.name}`;
    const filePath = `menu/${filename}`;

    const arrayBuffer = await image.arrayBuffer();
    const bufferPhoto = Buffer.from(arrayBuffer);

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": image.type,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          "x-upsert": "true",
        },
        body: bufferPhoto,
      }
    );
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

    if (!uploadRes.ok) {
      console.error(uploadRes);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    await prisma.cafepos_menu_items.create({
      data: {
        name,
        price,
        category,
        image: publicUrl,
        addons: {
          create: addons.map((a) => ({
            name: a.name,
            level: a.level,
            price: a.price,
          })),
        },
        variety: {
          create: variations.map((v) => ({
            name: v.name,
            price: v.price,
          })),
        },
      },
    });
  } else {
    await prisma.cafepos_menu_items.create({
      data: {
        name,
        price,
        category,
        addons: {
          create: addons.map((a) => ({
            name: a.name,
            level: a.level,
            price: a.price,
          })),
        },
        variety: {
          create: variations.map((v) => ({
            name: v.name,
            price: v.price,
          })),
        },
      },
    });
  }

  return NextResponse.json({ success: true });
}
