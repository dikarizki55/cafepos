"use client";

import { IconCard } from "@/components/home/Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import { useEffect, useState } from "react";
import { useNewOrder } from "../orderline/NewOrder";
import { useLine } from "../orderline/Line";
import { useSession } from "next-auth/react";

type PurchaseType = { id: string; nominal: number };

export function Purchase() {
  const { purchase, setPurchase, setNewOrder, setSelectedMenu } = useNewOrder();
  const [open, setOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cash, setCash] = useState("");
  const { refresh, setRefresh } = useLine();
  const { data: session } = useSession();

  const cashNum = Number(cash);

  useEffect(() => {
    if (purchase) {
      const handler = setTimeout(() => {
        setOpen(true);
      }, 10);

      return () => clearTimeout(handler);
    }
  }, [purchase]);
  useEffect(() => {
    if (!open) {
      const handler = setTimeout(() => {
        setPurchase("");
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [open, setNewOrder, setPurchase, setSelectedMenu]);

  const [data, setData] = useState<PurchaseType>({
    id: "",
    nominal: 0,
  });
  useEffect(() => {
    if (purchase) {
      async function getData() {
        try {
          const res = await fetch(
            `/api/admin/orderprocess/payment/${purchase}`,
            {
              credentials: "include",
            }
          ).then((res) => res.json());

          if (!res.data) throw new Error();

          setData(res.data);
          if (res.data.status !== "unpaid") {
            setPaid(true);
          }
        } catch {
          console.log("error");
        }
      }

      getData();
    }
  }, [purchase]);

  async function handlePayment() {
    if (cashNum - data.nominal > 0) {
      try {
        const res = await fetch(`/api/admin/orderprocess/${data.id}`, {
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify({
            user_id: session?.user?.id,
            status: "paid",
            cash_received: cashNum,
            change_amount: cashNum - data.nominal,
          }),
        });

        if (!res.ok) {
          throw new Error();
        }

        setRefresh(!refresh);
        setOpen(false);
        setNewOrder(false);
        setSelectedMenu([]);
      } catch {
        console.log("error");
      }
    }
  }

  return (
    <>
      {purchase && (
        <div
          className={`${
            open ? "w-116 opacity-100 h-fit" : "w-0 opacity-0 h-0"
          }  p-5 transition-all duration-300 overflow-y-scroll`}
        >
          <div className="w-full px-12 bg-white flex flex-col justify-start items-center gap-5">
            {!paid && (
              <>
                <div className="self-stretch inline-flex justify-start items-center gap-2.5">
                  <IconCard className=" w-9" />
                  <div className="justify-start text-black text-2xl font-bold font-['Inter']">
                    Cash Payment
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-between items-start">
                  <div className="justify-start text-black text-base font-medium font-['Inter']">
                    Transaction ID
                  </div>
                  <div className="justify-start text-black text-base font-medium font-['Inter']">
                    {data.id}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-bold font-['Inter']">
                    Total Amount
                  </div>
                  <div className="justify-start text-black text-xl font-bold font-['Inter']">
                    {formatRupiah(data.nominal)}
                  </div>
                </div>
                <div className="text-right justify-start text-black text-base font-bold font-['Inter']">
                  Cash Received
                </div>
                <input
                  type="number"
                  required
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  className={` ${
                    cashNum - data.nominal < 0
                      ? "text-red-400 border-red-400 outline outline-red-400"
                      : "border-black"
                  } self-stretch px-5 py-3 rounded-full border text-xl font-bold`}
                />
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="text-black font-bold">Change Due</div>
                  <div
                    className={` ${
                      cashNum - data.nominal < 0
                        ? " text-red-400"
                        : " text-black"
                    } text-xl font-bold `}
                  >
                    {formatRupiah(cashNum - data.nominal)}
                  </div>
                </div>
                <div
                  className="self-stretch h-11 py-2.5 bg-primary rounded-3xl inline-flex justify-center items-center gap-4 cursor-pointer"
                  onClick={handlePayment}
                >
                  <div className="flex justify-start items-center gap-2.5">
                    <IconCard className=" w-6" />
                    <div className="justify-start text-black text-base font-bold font-['Inter']">
                      Confirm Payment
                    </div>
                  </div>
                </div>
              </>
            )}
            {paid && (
              <div className=" font-bold text-4xl mb-6">It was Paid</div>
            )}
            <div
              className="self-stretch px-5 py-2.5 rounded-3xl outline-1 font-bold text-red-400 outline-red-400 flex justify-center items-center cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </div>
          </div>
        </div>
      )}
    </>
  );
}
