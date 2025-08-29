"use client";

import OrderLine from "@/components/admin/dashboard/orderprocess/OrderLine";
import { NewOrderProvider } from "@/components/admin/dashboard/orderprocess/orderline/NewOrder";
import OrderSideBar from "@/components/admin/dashboard/orderprocess/OrderSideBar";
import { TransactionDetailsProvider } from "@/components/admin/dashboard/orderprocess/ordersidebar/TransactionDetails";

export default function OrderProcess() {
  return (
    <div className=" flex-1 flex gap-2.5 w-100">
      <TransactionDetailsProvider>
        <NewOrderProvider>
          <OrderLine />
          <OrderSideBar />
        </NewOrderProvider>
      </TransactionDetailsProvider>
    </div>
  );
}
