"use client";
import { IconSave } from "./Icon";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { formatDate, formatRupiah } from "@/lib/formatRupiah";
import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { useRouter } from "next/navigation";
import StatusAnimation from "./StatusAnimation";

export default function TransactionHome({
  data,
}: {
  data: Prisma.cafepos_transactionGetPayload<{
    include: {
      transaction_menu_items: {
        include: { addon: true; variety: true; menu_items: true };
      };
    };
  }>;
}) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [hideButton, setHideButton] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(handler);
  }, [router]);

  const dataWithImage = data.transaction_menu_items;

  const handleDownload = async () => {
    if (!ref.current) return;
    setHideButton(true);
    setTimeout(async () => {
      if (!ref.current) return;
      const dataUrl = await htmlToImage.toJpeg(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const date = new Date();
      const time = formatDate(date);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Dika Resto Transaction - ${time}.jpeg`;
      link.click();

      setHideButton(false);
    }, 100);
  };

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

  function getDate() {
    const date = new Date(data.created_at);
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });
    const dateDay = date.getDate();

    return `${time} | ${year} ${month} ${dateDay}`;
  }

  if (!mounted) return null;

  return (
    <div
      className=" max-w-110 px-10 py-15 flex flex-col justify-start items-center gap-7 overflow-hidden bg-white"
      ref={ref}
    >
      <div className="self-stretch text-center flex items-center flex-col gap-2 text-3xl font-bold">
        {data.status !== "cancel" && <StatusAnimation status={data.status} />}
        {data.status === "unpaid" && "Show QR to Cashier"}
        {data.status === "paid" && "Payment Successfull"}
        {data.status === "process" && "On Cooking..."}
        {data.status === "ready" && "On the Way to Your Table..."}
        {data.status === "done" && "Enjoy your food"}
      </div>
      {/* {!["unpaid", "cancel"].includes(data.status) ? (
        <>
          <IconSuccess className=" w-20 text-success" />
          <div className="self-stretch text-center justify-start text-black text-3xl font-bold font-['Inter']">
            {data.status === "paid" && "Payment Successfull"}
            {data.status === "process" && "Cooking Process..."}
            {data.status === "ready" && "On the Way to Your Table..."}
            {data.status === "done" && "Enjoy your food"}
          </div>
        </>
      ) : (
        <>
          <IconWarning className=" w-20 text-primary" />
          <div className="self-stretch text-center justify-start text-black text-3xl font-bold font-['Inter']">
            Show QR to Cashier
          </div>
        </>
      )} */}
      <QRCodeSVG
        value={`${window.location.origin}/transaction/${data.id}`}
        className="w-50 h-50 my-2"
      />
      <div className="self-stretch flex flex-col justify-start items-start gap-5">
        <div className=" self-stretch flex flex-col justify-start items-start gap-2">
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
              {getDate()}
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
              Status
            </div>
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {data.status}
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
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Cash Received
            </div>

            <div className="justify-start text-black text-base font-normal font-['Inter']">
              {formatRupiah(Number(data?.cash_received))}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-normal font-['Inter']">
              Cash Change
            </div>
            <div className="justify-start text-red-400 text-base font-normal font-['Inter']">
              -{formatRupiah(Number(data?.change_amount))}
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          {dataWithImage.map((item, index) => (
            <div
              key={item.id}
              className="self-stretch inline-flex justify-between items-start"
            >
              <div className="self-stretch flex justify-start items-center gap-2.5">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                  {item.menu_items.image && (
                    <Image
                      alt={item.name}
                      src={item.menu_items.image}
                      fill
                      className=" object-cover"
                      crossOrigin="anonymous"
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
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              Subtotal
            </div>
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              {formatRupiah(
                Number(data.nominal) -
                  Number(data.service_charge) -
                  Number(data.tax)
              )}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              Service Charge
            </div>
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              {formatRupiah(Number(data.service_charge))}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              Tax
            </div>
            <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
              {formatRupiah(Number(data.tax))}
            </div>
          </div>
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-bold font-['Inter']">
              Total
            </div>
            <div className="justify-start text-black text-base font-bold font-['Inter']">
              {formatRupiah(Number(data.nominal))}
            </div>
          </div>
        </div>
      </div>
      {!hideButton && (
        <div
          className="self-stretch px-5 py-2.5 bg-primary rounded-full gap-3 flex justify-center items-center cursor-pointer"
          onClick={handleDownload}
        >
          <IconSave className=" w-4" />
          <div className="justify-start text-black text-base font-bold font-['Inter']">
            Save Transactions
          </div>
        </div>
      )}
    </div>
  );
}
