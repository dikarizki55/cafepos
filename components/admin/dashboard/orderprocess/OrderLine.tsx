import { IconSearch } from "@/components/home/Icon";
import { Line } from "./orderline/Line";
import NewOrder, { useNewOrder } from "./orderline/NewOrder";
import { useState } from "react";
import { StatusType } from "./orderline/OrderCard";

export default function OrderLine() {
  const { newOrder } = useNewOrder();
  const [filter, setFilter] = useState<StatusType | "default">("default");

  const filterDefine: (StatusType | "default")[] = [
    "default",
    "unpaid",
    "paid",
    "process",
    "ready",
    "done",
    "cancel",
  ];

  return (
    <div
      className={`relative w-full h-full px-9 py-6 bg-white rounded-[35px] flex flex-col justify-start items-start gap-3.5 overflow-auto  `}
    >
      {!newOrder && (
        <>
          <div className="self-stretch py-2.5 gap-5 flex justify-between items-center">
            <div className=" overflow-x-auto flex justify-start items-center gap-2">
              {filterDefine.map((item) => (
                <div
                  key={item}
                  className={`px-4 py-1.5 ${
                    item === filter ? "bg-primary" : "bg-disable"
                  }  rounded-full flex flex-col justify-center items-center cursor-pointer`}
                >
                  <div
                    className="text-xs font-normal capitalize"
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
            <IconSearch className=" w-5" />
          </div>

          {filter === "default" && (
            <>
              <Line status="ready" />
              <Line status="process" />
              <Line status="paid" />
              <Line status="unpaid" />
            </>
          )}

          {filter !== "default" && <Line status={filter} wrap />}
        </>
      )}

      <NewOrder />
    </div>
  );
}
