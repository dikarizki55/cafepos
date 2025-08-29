import { SerializedSelectedMenuType } from "@/components/home/content/Selected";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    menuOrder,
    paymentMethod,
    userId,
    table: tableBody,
  }: {
    menuOrder: SerializedSelectedMenuType;
    paymentMethod: string;
    userId: string;
    table: string;
  } = await req.json();
  const referer = req.headers.get("referer");
  if (!referer) return;
  const parsedUrl = new URL(referer);
  const tableUrl = Number(parsedUrl.searchParams.get("table"));

  const table = tableUrl > 0 ? tableUrl : Number(tableBody);

  const filtered = menuOrder.map((item) => ({
    id: item.id,
    addons: item.addons.map((a) => ({ id: a.id, level: a.level })),
    variety: [{ id: item.variety[0].id }],
    qty: item.qty,
  }));

  const data = await prisma.cafepos_menu_items.findMany({
    where: {
      id: { in: filtered.map((f) => f.id) },
    },
    include: {
      addons: {
        where: {
          id: { in: filtered.flatMap((f) => f.addons.map((a) => a.id)) },
        },
      },
      variety: {
        where: {
          id: { in: filtered.flatMap((f) => f.variety.map((v) => v.id)) },
        },
      },
    },
  });

  const editedData = filtered
    .map((f) => {
      const found = data.find((s) => s.id === f.id);
      if (!found) return undefined;
      const { id: menuItemId, ...menu } = found;
      return {
        ...menu,
        menu_item_id: menuItemId,
        qty: f.qty,
        addons: f.addons
          .map((fa) => {
            const addons = menu.addons.find((ma) => ma.id === fa.id);
            if (!addons) return undefined;
            return {
              name: addons.name,
              created_at: addons.created_at,
              updated_at: addons.updated_at,
              price: addons.price,
              level: fa.level,
            };
          })
          .filter((f) => f !== undefined),
        variety: f.variety
          .map((fv) => {
            const variety = menu.variety.find((mv) => mv.id === fv.id);
            if (!variety) return undefined;
            return {
              name: variety.name,
              created_at: variety.created_at,
              updated_at: variety.updated_at,
              price: variety.price,
            };
          })
          .filter((f) => f !== undefined),
      };
    })
    .filter((f) => f !== undefined);

  const calculation = (() => {
    const subtotal = editedData.reduce((acc, item) => {
      if (!item) return 0;
      return (
        acc +
        (Number(item.price) +
          item.variety.reduce((tv, v) => tv + Number(v?.price), 0) +
          item.addons.reduce((at, a) => at + Number(a?.price), 0)) *
          item.qty
      );
    }, 0);
    const serviceCharge = Math.ceil(subtotal * 0.05);
    const tax = Math.ceil((subtotal + serviceCharge) * 0.11);
    const total = Math.ceil(subtotal + serviceCharge + tax);
    return { serviceCharge, total, tax };
  })();

  const create = await prisma.cafepos_transaction.create({
    data: {
      table,
      ...(userId !== "" ? { user_id: userId } : {}),
      transaction_type: paymentMethod,
      nominal: calculation.total,
      service_charge: calculation.serviceCharge,
      tax: calculation.tax,
      status: "unpaid",
      transaction_menu_items: {
        create: editedData.map((d) => ({
          menu_item_id: d.menu_item_id,
          name: d.name,
          price: d.price,
          qty: d.qty,
          addon: { create: d.addons.map((a) => a) },
          variety: {
            create: d.variety.map((v) => v),
          },
        })),
      },
    },
  });

  return NextResponse.json({ data: create.id });
}
