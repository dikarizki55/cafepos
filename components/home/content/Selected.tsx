"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { dataMenuType, useFilter } from "./Filter";
import { createPortal } from "react-dom";
import Drawer from "../Drawer";
import Image from "next/image";
import {
  IconAddFill,
  IconCard,
  IconCart,
  IconDollarSign,
  IconGopay,
  IconMinFill,
  IconPaypal,
} from "../Icon";
import { IconEdit } from "@/components/admin/dashboard/Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import EditMenu from "./EditMenu";
import { motion } from "motion/react";
import CircleSelect from "./selected/CircleSelect";
import { useRouter } from "next/navigation";

export type SelectedMenuType = dataMenuType & {
  qty: number;
};

export type SerializedSelectedMenuType = SelectedMenuType[];

type SelectedContextType = {
  selectedMenu: SerializedSelectedMenuType;
  setSelectedMenu: Dispatch<SetStateAction<SerializedSelectedMenuType>>;
};

const SelectedContext = createContext<SelectedContextType | undefined>(
  undefined
);

export function SelectedProvider({ children }: { children: ReactNode }) {
  const [selectedMenu, setSelectedMenu] = useState<SerializedSelectedMenuType>(
    []
  );

  return (
    <SelectedContext.Provider value={{ selectedMenu, setSelectedMenu }}>
      {children}
    </SelectedContext.Provider>
  );
}

export function useSelected() {
  const context = useContext(SelectedContext);

  if (!context) {
    throw new Error("useFilter must be use with FilterProvider");
  }

  return context;
}

export const handleSelectedMenu = (
  menu: SelectedMenuType,
  selectedMenu: SelectedContextType["selectedMenu"],
  setSelectedMenu: SelectedContextType["setSelectedMenu"]
) => {
  const isDataActive = selectedMenu.some((item) => item.id === menu.id);
  if (isDataActive) {
    const removeMenu = selectedMenu.filter((item) => item.id !== menu.id);
    setSelectedMenu(removeMenu);
  } else {
    setSelectedMenu((prev) => [...prev, { ...menu, addons: [], variety: [] }]);
  }
};

export function addSelectedMenu(
  menu: SelectedMenuType,
  setSelectedMenu: SelectedContextType["setSelectedMenu"]
) {
  setSelectedMenu((prev) => [...prev, menu]);
}

export function changeQty(
  value: number,
  index: number,
  selectedMenu: SelectedContextType["selectedMenu"],
  setSelectedMenu: SelectedContextType["setSelectedMenu"]
) {
  const currentQty = selectedMenu[index].qty;
  const nextQty = currentQty + value;

  if (nextQty > 0) {
    setSelectedMenu((prev) => {
      if (!Array.isArray(prev)) {
        return [];
      }
      const newArr = [...prev];
      newArr[index].qty = nextQty;
      return newArr;
    });
  } else {
    const filtered = selectedMenu.filter((_, i) => i !== index);
    setSelectedMenu(filtered);
  }
}

export function getTotal(
  index: number,
  selectedMenu: SelectedContextType["selectedMenu"]
) {
  const basePrice = Number(selectedMenu[index].price);
  const varietyPrice = Number(selectedMenu[index].variety[0].price);
  const addonPrice =
    selectedMenu[index].addons.reduce(
      (total, addon) => total + Number(addon.price),
      0
    ) ?? 0;

  return (basePrice + varietyPrice + addonPrice) * selectedMenu[index].qty;
}

export const calculation = (
  selectedMenu: SelectedContextType["selectedMenu"]
) => {
  const subtotal = selectedMenu.reduce((acc, _, index) => {
    return acc + getTotal(index, selectedMenu);
  }, 0);
  const serviceCharge = subtotal * 0.05;
  const tax = (subtotal + serviceCharge) * 0.11;
  const total = subtotal + serviceCharge + tax;
  return { subtotal, serviceCharge, total, tax };
};

export const handleEditSelectedMenu = (
  data: SelectedMenuType,
  index: number,
  selectedMenu: SelectedContextType["selectedMenu"],
  setSelectedMenu: SelectedContextType["setSelectedMenu"]
) => {
  const newArray = [...selectedMenu];
  newArray[index] = data;
  setSelectedMenu(newArray);
};

export const paymentMethod = [
  {
    id: "cashier",
    name: "Pay on Cashier",
    icon: <IconDollarSign className="w-5" />,
  },
  {
    id: "paypal",
    name: "Paypal",
    icon: <IconPaypal className="w-5" />,
  },
  {
    id: "gopay",
    name: "Gopay",
    icon: <IconGopay className="w-5" />,
  },
];

export default function Selected() {
  const router = useRouter();

  const { rawDataMenu } = useFilter();

  const { selectedMenu, setSelectedMenu } = useSelected();
  const [mounted, setMounted] = useState(false);
  const [editMenu, setEditMenu] = useState<SelectedMenuType>();
  const [indexEdit, setIndexEdit] = useState(0);
  const [paymentMethodSelect, setPaymentMethodSelect] = useState(0);

  const handlePurchase = async () => {
    try {
      const res = await fetch("/api/transaction", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          menuOrder: selectedMenu,
          paymentMethod: paymentMethod[paymentMethodSelect].id,
        }),
      }).then((res) => res.json());

      if (!res.data) throw new Error("Error");

      router.push(`/transaction/${res.data}`);
    } catch {
      console.log("error");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div>
      {mounted &&
        selectedMenu.length > 0 &&
        createPortal(
          <div className="w-full h-24 bg-gradient-to-b from-black/0 to-black/50 fixed z-10 bottom-0 flex justify-center items-center">
            <div className="w-72 px-5 py-2.5 bg-primary rounded-3xl inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-[3px]">
                <div className="justify-start text-black text-sm font-bold">
                  {selectedMenu.length}
                </div>
                <div className="justify-start text-black text-sm font-normal">
                  items selected
                </div>
              </div>
              <div className="justify-start text-black text-sm font-bold">
                <Drawer
                  className=" w-full h-full absolute top-0 left-0"
                  onClose={() => {
                    setEditMenu(undefined);
                  }}
                >
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
                                  changeQty(
                                    -1,
                                    index,
                                    selectedMenu,
                                    setSelectedMenu
                                  );
                                }}
                              />
                              <div className="w-3 text-center justify-start text-black text-lg font-medium ">
                                {item.qty}
                              </div>
                              <IconAddFill
                                className=" w-3.5"
                                onClick={() => {
                                  changeQty(
                                    +1,
                                    index,
                                    selectedMenu,
                                    setSelectedMenu
                                  );
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
                            {formatRupiah(
                              calculation(selectedMenu).serviceCharge
                            )}
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
                        item={editMenu}
                        edit={true}
                        rawDataMenu={rawDataMenu}
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
                </Drawer>
                View order
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
