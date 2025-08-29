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
        include: { addon: true, variety: true, menu_items: true },
      },
    },
  });

  if (!data) return;

  const numberData = JSON.parse(JSON.stringify(data));

  return <TransactionHome data={numberData} />;
}
