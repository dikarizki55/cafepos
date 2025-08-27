"use server";

import prisma from "@/lib/prisma";
import TransactionHome from "@/components/transaction/TransactionHome";

export default async function Transaction({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await prisma.cafepos_transaction.findUnique({
    where: { id },
    include: {
      transaction_menu_items: {
        include: { addon: true, variety: true },
      },
    },
  });

  if (!data) return;

  const raw = await prisma.cafepos_menu_items.findMany({
    where: {
      id: { in: data.transaction_menu_items.map((d) => d.menu_item_id) },
    },
  });

  function getImage(id: string): string {
    const founded = raw.find((f) => f.id === id);
    if (!founded) return "";
    if (!founded.image) return "";
    return founded.image;
  }

  const dataWithImage = data.transaction_menu_items.map((d) => ({
    ...d,
    image: getImage(d.menu_item_id),
  }));

  const numberData = JSON.parse(JSON.stringify(data));
  const numberDataWithImage = JSON.parse(JSON.stringify(dataWithImage));

  return (
    <TransactionHome data={numberData} dataWithImage={numberDataWithImage} />
  );
}
