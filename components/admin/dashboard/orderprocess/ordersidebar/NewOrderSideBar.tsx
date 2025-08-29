"use client";

import { useEffect, useState } from "react";
import { useNewOrder } from "../orderline/NewOrder";
import { motion } from "motion/react";
import {
  IconAddFill,
  IconCard,
  IconCart,
  IconMinFill,
} from "@/components/home/Icon";
import Image from "next/image";
import { IconEdit } from "../../Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import {
  calculation,
  changeQty,
  getTotal,
  handleEditSelectedMenu,
  paymentMethod,
  SelectedMenuType,
} from "@/components/home/content/Selected";
import CircleSelect from "@/components/home/content/selected/CircleSelect";
import EditMenu from "@/components/home/content/EditMenu";

export default function NewOrderSideBar() {
  const [open, setOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<SelectedMenuType>();
  const [indexEdit, setIndexEdit] = useState(0);
  const { newOrder, setNewOrder, selectedMenu, setSelectedMenu, dataMenu } =
    useNewOrder();

  const [paymentMethodSelect, setPaymentMethodSelect] = useState(0);

  useEffect(() => {
    if (newOrder) {
      const handler = setTimeout(() => {
        setOpen(true);
      }, 10);

      return () => clearTimeout(handler);
    }
  }, [newOrder]);
  useEffect(() => {
    if (!open) {
      const handler = setTimeout(() => {
        setNewOrder(false);
        setSelectedMenu([]);
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [open, setNewOrder, setSelectedMenu]);

  function handlePurchase() {}

  return (
    <>
      {newOrder && (
        <div
          className={`${
            open ? "w-116 opacity-100 h-fit" : "w-0 opacity-0 h-0"
          }  p-5 transition-all duration-300 overflow-y-scroll`}
        >
          <div onClick={() => setOpen(false)}></div>
          {!editMenu && (
            <motion.div
              initial={{ y: 1000, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 1000, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full px-7 py-5 pb-15 bg-white inline-flex flex-col justify-start items-center gap-7 overflow-hidden"
            >
              <div className="w-full inline-flex justify-start items-center gap-2.5">
                <IconCart className=" w-7" />
                <div className="justify-start text-black text-2xl font-bold ">
                  Cart
                </div>
              </div>
              {selectedMenu.map((item, index) => (
                <div
                  className="w-full inline-flex justify-between items-start"
                  key={item.id + index}
                >
                  <div className="self-stretch flex justify-start items-center gap-2.5">
                    <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                      {item.image && (
                        <Image
                          alt={item.name}
                          src={item.image}
                          sizes="100%"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch h-5 inline-flex justify-start items-center gap-2">
                        <div className="justify-start text-black text-base font-medium leading-4">
                          {item.name}
                        </div>
                        <IconEdit
                          className=" w-3.5"
                          onClick={() => {
                            setEditMenu(item);
                            setIndexEdit(index);
                          }}
                        />
                      </div>
                      <div className="justify-start text-zinc-500 text-xs font-light ">
                        {item.variety[0].name},{" "}
                        {item.addons.map((a) => (
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
                      <IconMinFill
                        className=" w-3.5"
                        onClick={() => {
                          changeQty(-1, index, selectedMenu, setSelectedMenu);
                        }}
                      />
                      <div className="w-3 text-center justify-start text-black text-lg font-medium ">
                        {item.qty}
                      </div>
                      <IconAddFill
                        className=" w-3.5"
                        onClick={() => {
                          changeQty(+1, index, selectedMenu, setSelectedMenu);
                        }}
                      />
                    </div>
                    <div className="justify-start text-black text-base font-medium ">
                      {formatRupiah(getTotal(index, selectedMenu))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="w-80 flex flex-col justify-start items-start gap-2">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    Subtotal
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    {formatRupiah(calculation(selectedMenu).subtotal)}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    Service Charge
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    {formatRupiah(calculation(selectedMenu).serviceCharge)}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    Tax
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal ">
                    {formatRupiah(calculation(selectedMenu).tax)}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-bold ">
                    Total
                  </div>
                  <div className="justify-start text-black text-base font-bold ">
                    {formatRupiah(calculation(selectedMenu).total)}
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                <div className="text-right justify-start text-black text-base font-bold ">
                  Payment Method
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  {paymentMethod.map((pm, index) => (
                    <motion.div
                      layoutId={pm.id}
                      whileTap={{ scale: 0.9 }}
                      key={pm.id}
                      onClick={() => setPaymentMethodSelect(index)}
                      className="self-stretch px-5 py-3 rounded-3xl border border-black flex justify-between items-center bg-white"
                    >
                      <div className="flex justify-start items-center gap-2.5">
                        {pm.icon}
                        <div className="justify-start text-black text-base font-medium ">
                          {pm.name}
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-1.5">
                        <CircleSelect
                          className=" w-4"
                          active={paymentMethodSelect === index}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <motion.div
                  className="self-stretch px-5 py-2.5 bg-primary rounded-3xl inline-flex justify-between items-center"
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePurchase}
                >
                  <div className="w-36 flex justify-start items-center gap-2.5">
                    <IconCard className=" w-6" />
                    <div className="justify-start text-black text-base font-bold ">
                      Purchase
                    </div>
                  </div>
                  <div className="justify-start text-black text-xl font-medium ">
                    {formatRupiah(calculation(selectedMenu).total)}
                  </div>
                </motion.div>
                <motion.div
                  className="self-stretch px-5 py-2.5 border border-red-400 text-red-400 rounded-3xl inline-flex justify-center items-center cursor-pointer"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </motion.div>
              </div>
            </motion.div>
          )}
          {editMenu && (
            <motion.div
              initial={{ y: 1000, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 1000, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className=" relative"
            >
              <EditMenu
                rawDataMenu={dataMenu}
                item={editMenu}
                edit={true}
                action={(tempselect) => {
                  handleEditSelectedMenu(
                    tempselect,
                    indexEdit,
                    selectedMenu,
                    setSelectedMenu
                  );
                  setEditMenu(undefined);
                }}
              />
            </motion.div>
          )}
        </div>
      )}
    </>
  );
}
