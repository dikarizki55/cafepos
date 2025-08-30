"use client";

import { IconAddFill } from "@/components/home/Icon";
import TransactionDetails, {
  useTransactionDetails,
} from "./ordersidebar/TransactionDetails";
import { useEffect, useState } from "react";
import { useNewOrder } from "./orderline/NewOrder";
import NewOrderSideBar from "./ordersidebar/NewOrderSideBar";
import { Purchase } from "./ordersidebar/Purchase";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

export default function OrderSideBar() {
  const [wideMode, setWideMode] = useState(false);
  const [wideAnimate, setWideAnimate] = useState(false);
  const { transactionDetailsId } = useTransactionDetails();
  const { purchase, newOrder, setNewOrder } = useNewOrder();
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (transactionDetailsId !== "" || newOrder || purchase !== "") {
      const handler = setTimeout(() => {
        setWideAnimate(true);
      }, 10);
      setWideMode(true);
      return () => clearTimeout(handler);
    } else {
      setWideMode(false);
    }
  }, [newOrder, purchase, transactionDetailsId]);

  useEffect(() => {
    if (!wideMode) {
      const handler = setTimeout(() => {
        setWideAnimate(false);
      }, 10);
      return () => clearTimeout(handler);
    }
  }, [wideMode]);

  useEffect(() => {
    if (session?.user?.id) {
      async function getData() {
        const res = await fetch("/api/admin/userinfo", {
          credentials: "include",
        }).then((res) => res.json());

        setUserInfo(res.user);
      }

      getData();
    }
  }, [session?.user?.id]);

  return (
    <div
      className={`py-10 bg-white rounded-tl-[35px] rounded-bl-[35px] flex flex-col justify-between items-center transition-all duration-300`}
    >
      <div
        className={` w-full px-5 py-5 bg-white rounded-[35px] flex ${
          wideMode ? "flex-row justify-between" : "flex-col justify-center"
        }  items-center gap-[5px] transition-all duration-300`}
      >
        <div className="w-12 h-12 p-2.5 bg-neutral-100 rounded-[100px] inline-flex justify-center items-center gap-2.5">
          <div className="justify-start text-black text-lg font-medium uppercase">
            {userInfo?.name.split(" ").map((fn) => fn[0])}
          </div>
        </div>
        <div className="self-stretch flex justify-center items-center text-center text-black text-base font-medium">
          {userInfo?.name}
        </div>
        <div className="self-stretch flex justify-center items-center text-center text-black text-sm font-normal font-['Inter']">
          {userInfo?.role}
        </div>
      </div>
      {!wideMode && (
        <div
          className={` ${
            !wideAnimate ? "opacity-100" : "opacity-0"
          } w-28 py-10 rounded-[35px] flex flex-col justify-start items-center gap-3 transition-all duration-300 cursor-pointer`}
          onClick={() => setNewOrder(true)}
        >
          <IconAddFill className=" text-primary w-20" />
          <div className="self-stretch text-center justify-start text-black text-lg font-medium font-['Inter']">
            New Order
          </div>
        </div>
      )}
      {wideMode && (
        <>
          <TransactionDetails />
          <NewOrderSideBar />
          <Purchase />
        </>
      )}
      <Clock />
    </div>
  );
}

export function Clock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Format ke HH:mm:ss (24 jam)
      const formatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // true kalau mau format 12 jam (AM/PM)
      });
      setTime(formatted);
    };

    update(); // jalankan sekali saat mount
    const interval = setInterval(update, 1000); // update tiap detik

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="w-28 py-7 bg-white rounded-[35px] flex flex-col justify-start items-center gap-[5px]">
      <div className="self-stretch text-center justify-start text-black text-lg font-medium font-['Inter']">
        Clock
      </div>
      <div className="self-stretch text-center justify-start text-black text-lg font-medium font-['Inter']">
        <span>{time}</span>
      </div>
    </div>
  );
}
