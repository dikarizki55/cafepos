"use server";

import prisma from "@/lib/prisma";
import { QRCodeSVG } from "qrcode.react";
import { IconWarning } from "./Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import Image from "next/image";

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

  function getTotal(index: number) {
    const basePrice = Number(dataWithImage[index].price);
    const varietyPrice = Number(dataWithImage[index].variety[0].price);
    const addonPrice =
      dataWithImage[index].addon.reduce(
        (total, addon) => total + Number(addon.price),
        0
      ) ?? 0;

    return (
      (basePrice + varietyPrice + addonPrice) * Number(dataWithImage[index].qty)
    );
  }

  return (
    <div className="w-full px-8 py-15 flex flex-col justify-start items-center gap-7 overflow-hidden">
      <IconWarning className=" w-20 text-primary" />
      <div className="self-stretch text-center justify-start text-black text-3xl font-bold font-['Inter']">
        Show QR to Cashier
      </div>
      <QRCodeSVG value={data.id} className="w-50 h-50 my-2" />
      <div className="self-stretch flex flex-col justify-start items-start gap-5">
        <div className="w-80 flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch justify-start text-black text-base font-bold font-['Inter']">
            Transaction Details
          </div>
          <div className="self-stretch">
            <div className="justify-start">Transaction ID</div>
            <div className="justify-start text-[14px] font-bold">{data.id}</div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Table
            </div>
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {data.table}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Date
            </div>
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {data.created_at.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // false = 24 jam, true = AM/PM
              })}{" "}
              |{" "}
              {`${data.created_at.getFullYear()} ${data.created_at.toLocaleString(
                "en-US",
                { month: "short" }
              )} ${data.created_at.getDate()}`}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Type of Transaction
            </div>
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {data.transaction_type}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Nominal
            </div>
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {formatRupiah(Number(data.nominal))}
            </div>
          </div>
        </div>
        <div className="w-80 flex flex-col justify-start items-start gap-5">
          {dataWithImage.map((item, index) => (
            <div
              key={item.id}
              className="self-stretch inline-flex justify-between items-start"
            >
              <div className="self-stretch flex justify-start items-center gap-2.5">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                  {item.image && (
                    <Image
                      alt={item.name}
                      src={item.image}
                      fill
                      className=" object-cover"
                    />
                  )}
                </div>
                <div className="self-stretch inline-flex flex-col justify-start items-start gap-[3px]">
                  <div className="self-stretch h-5 inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-black text-base font-medium font-['Inter']">
                      {item.name}
                    </div>
                  </div>
                  <div className="justify-start text-zinc-500 text-xs font-light font-['Inter']">
                    {item.variety[0].name},{" "}
                    {item.addon.map((a) => (
                      <span key={a.id}>
                        {a.name}
                        {a.level && ` ${a.level}`},{" "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="self-stretch inline-flex flex-col justify-between items-end">
                <div className="inline-flex justify-start items-center gap-2.5">
                  <div className="text-center justify-start text-black text-lg font-medium font-['Inter']">
                    {item.qty.toString()} pcs
                  </div>
                </div>
                <div className="justify-start text-black text-base font-medium font-['Inter']">
                  {formatRupiah(getTotal(index))}
                </div>
              </div>
            </div>
          ))}

          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                Subtotal
              </div>
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                {formatRupiah(
                  data.nominal.toNumber() -
                    data.service_charge.toNumber() -
                    data.tax.toNumber()
                )}
              </div>
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                Service Charge
              </div>
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                {formatRupiah(data.service_charge.toNumber())}
              </div>
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                Tax
              </div>
              <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                {formatRupiah(data.tax.toNumber())}
              </div>
            </div>
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-black text-base font-bold font-['Inter']">
                Total
              </div>
              <div className="justify-start text-black text-base font-bold font-['Inter']">
                {formatRupiah(data.nominal.toNumber())}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch px-5 py-2.5 bg-primary rounded-3xl inline-flex justify-between items-center">
        <div className="flex justify-start items-center gap-2.5">
          <div className="w-4 h-5 bg-black" />
          <div className="justify-start text-black text-base font-bold font-['Inter']">
            Save Transactions
          </div>
        </div>
      </div>
    </div>
  );
}
