import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await requireAuth();

  const oldImage = await prisma.cafepos_menu_items
    .findUnique({
      where: { id: id },
      select: { image: true },
    })
    .then((body) => body?.image);

  if (oldImage) {
    const urlOldImage = String(oldImage).replace("/public", "");

    const deleteOld = await fetch(urlOldImage, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    });

    if (!deleteOld.ok) {
      console.log(await deleteOld.json());
      return NextResponse.json(
        { message: "error to delete old image" },
        { status: deleteOld.status }
      );
    }
  }

  await prisma.cafepos_menu_items.delete({ where: { id: id } });

  return NextResponse.json({ success: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await requireAuth();

  const res = await req.formData();
  const name = res.get("name") as string;
  const price = res.get("price") as string;
  const category = res.get("category") as string;
  const addons: { id: string; name: string; level: string; price: string }[] =
    JSON.parse(String(res.get("addons")));
  const variations: { id: string; name: string; price: string }[] = JSON.parse(
    String(res.get("variations"))
  );
  const image = res.get("image") as File;

  const data = await prisma.cafepos_menu_items.findUnique({
    where: { id: id },
  });

  if (!data) return NextResponse.json({ success: false }, { status: 400 });

  let imageUrl = "";

  if (image) {
    const bucket = "cafepos";
    const oldImage = data.image;

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

    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

    if (!uploadRes.ok) {
      console.error(uploadRes);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const urlOldImage = String(oldImage).replace("/public", "");

    if (oldImage) {
      const deleteOld = await fetch(urlOldImage, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      });

      if (!deleteOld.ok) {
        console.error(deleteOld);
        return NextResponse.json({ success: false }, { status: 500 });
      }
    }
  }

  await prisma.cafepos_menu_items.update({
    where: { id },
    data: {
      name,
      price,
      category,
      ...(image && { image: imageUrl }),
      addons: {
        deleteMany: {
          id: { notIn: addons.filter((a) => a.id).map((a) => a.id) },
        },
        upsert: addons.map((a) => ({
          where: { id: a.id ?? "" },
          update: {
            name: a.name,
            level: a.level,
            price: a.price,
          },
          create: {
            name: a.name,
            level: a.level,
            price: a.price,
          },
        })),
      },

      variety: {
        deleteMany: {
          id: { notIn: variations.filter((v) => v.id).map((v) => v.id) },
        },
        upsert: variations.map((v) => ({
          where: { id: v.id ?? "" },
          update: {
            name: v.name,
            price: v.price,
          },
          create: {
            name: v.name,
            price: v.price,
          },
        })),
      },
    },
  });

  return NextResponse.json({ success: true });
}
