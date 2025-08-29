import { IconCard } from "@/components/home/Icon";
import React from "react";
import { IconCheckmark, IconClock, IconFood } from "../../Icon";
import { useLine } from "./Line";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTransactionDetails } from "../ordersidebar/TransactionDetails";
import { useNewOrder } from "./NewOrder";

dayjs.extend(relativeTime);

export type OrderCardType = {
  id: string;
  table: string;
  items: string;
  created_at: string;
  updated_at: string;
};

export default function OrderCard({
  data = { id: "", table: "", created_at: "", updated_at: "", items: "" },
  status,
  ...rest
}: {
  data?: OrderCardType;
  status: "unpaid" | "paid" | "process" | "ready" | "done" | "cancel";
} & React.HTMLAttributes<HTMLDivElement>) {
  const statusDefine = {
    unpaid: {
      color: "bg-red-400",
      action: "Payment",
      actionFunction: () => {
        setPurchase(data.id);
      },
      icon: <IconCard className=" w-3.5" />,
    },
    paid: {
      color: "bg-blue-500",
      action: "Process",
      actionFunction: () => {},
      icon: <IconClock className=" w-3.5" />,
    },
    process: {
      color: "bg-primary",
      action: "Process",
      actionFunction: () => {},
      icon: <IconFood className=" w-3.5" />,
    },
    ready: {
      color: "bg-emerald-500",
      action: "Served",
      actionFunction: () => {},
      icon: <IconCheckmark className=" w-3.5" />,
    },
    done: {
      color: "bg-emerald-500",
      action: "",
      actionFunction: () => {},
      icon: <></>,
    },
    cancel: {
      color: "bg-disable",
      action: "",
      actionFunction: () => {},
      icon: <></>,
    },
  };

  const { refresh, setRefresh } = useLine();
  const { setTransactionDetailsId, setItems } = useTransactionDetails();

  const { setPurchase } = useNewOrder();

  const orderCode = (() => {
    const dateData = new Date(data.created_at);
    const hour = dateData.getHours();
    const minutes = dateData.getMinutes();
    const seconds = dateData.getSeconds().toString().padStart(2, "0");
    const day = dateData.getDate();
    const month = dateData.getMonth().toString().padStart(2, "0");
    const year = dateData.getFullYear().toString().slice(2, 4);
    return `${year}${month}${day}-${hour}${minutes}${seconds}`;
  })();

  const handleCancelOrder = async () => {
    await fetch(`/api/admin/orderprocess/${data.id}`, {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ status: "cancel" }),
    });

    setRefresh(!refresh);
  };

  const handleDetailTransaction = () => {
    setTransactionDetailsId(data.id);
    setItems(Number(data.items));
    setPurchase("");
  };

  function handleAction() {
    statusDefine[status].actionFunction();
    setTransactionDetailsId("");
    setItems(0);
  }

  const getTime = (time: Date) => {
    return dayjs(time).fromNow();
  };

  return (
    <div
      className="flex-none w-64 px-3 py-3.5 bg-white rounded-2xl shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] outline-1 outline-offset-[-1px] inline-flex flex-col justify-start items-start gap-3"
      {...rest}
    >
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="justify-start text-black text-xs font-bold font-['Inter']">
          Order #{orderCode}
        </div>
        <div
          className={`px-2.5 py-0.5 ${statusDefine[status].color} rounded-2xl flex justify-center items-center gap-2.5`}
        >
          <div
            className={`${
              status !== "cancel" ? "text-white" : "text-gray-400"
            } justify-start text-xs font-bold capitalize`}
          >
            {status}
          </div>
        </div>
      </div>
      <div className="self-stretch justify-start text-black text-xs font-normal font-['Inter']">
        <div>Transaction Id</div>
        <div>{data.id}</div>
      </div>
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="justify-start text-black text-xs font-normal font-['Inter']">
          Table {data.table}
        </div>
        <div className="justify-start text-black text-xs font-normal font-['Inter']">
          {getTime(new Date(data.created_at))}
        </div>
      </div>
      <div className="self-stretch inline-flex justify-start items-center gap-2.5">
        {statusDefine[status].action === "" && (
          <div
            className="flex-1 px-6 py-1.5 bg-primary rounded-2xl flex justify-center items-center text-xs font-normal cursor-pointer"
            onClick={handleDetailTransaction}
          >
            {data.items} Items
          </div>
        )}
        {statusDefine[status].action !== "" && (
          <>
            <div
              className="flex-1 px-6 py-1.5 rounded-2xl outline-1 outline-offset-[-1px] outline-primary flex justify-center items-center gap-2.5 cursor-pointer"
              onClick={handleDetailTransaction}
            >
              <div className="justify-start text-black text-xs font-normal">
                {data.items} Items
              </div>
            </div>

            <div
              className="flex-1 px-6 py-1.5 bg-primary rounded-2xl flex justify-center items-center gap-[5px] cursor-pointer"
              onClick={() => handleAction()}
            >
              {statusDefine[status].icon}
              <div className="justify-start text-black text-xs font-normal">
                {statusDefine[status].action}
              </div>
            </div>
          </>
        )}
      </div>
      {status === "unpaid" && (
        <div
          className="self-stretch inline-flex justify-start items-center gap-2.5 cursor-pointer"
          onClick={handleCancelOrder}
        >
          <div className="flex-1 px-6 py-1.5 rounded-2xl outline-1 outline-offset-[-1px] outline-red-400 flex justify-center items-center gap-2.5">
            <div className="justify-start text-red-400 text-xs font-normal">
              Cancel Order
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
