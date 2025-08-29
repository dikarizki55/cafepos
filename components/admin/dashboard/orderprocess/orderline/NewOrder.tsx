"use client";

import { levelParser } from "@/components/home/content/EditMenu";
import { dataMenuType } from "@/components/home/content/Filter";
import {
  addSelectedMenu,
  SelectedMenuType,
} from "@/components/home/content/Selected";
import { IconAddFill, IconSearch } from "@/components/home/Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import Image from "next/image";
import { createContext, useContext, useEffect, useState } from "react";

type NewOrderContextType = {
  newOrder: boolean;
  setNewOrder: React.Dispatch<React.SetStateAction<boolean>>;
  purchase: string;
  setPurchase: React.Dispatch<React.SetStateAction<string>>;
  dataMenu: dataMenuType[];
  setDataMenu: React.Dispatch<React.SetStateAction<dataMenuType[]>>;
  selectedMenu: SelectedMenuType[];
  setSelectedMenu: React.Dispatch<React.SetStateAction<SelectedMenuType[]>>;
};

const NewOrderContext = createContext<NewOrderContextType | null>(null);

export function NewOrderProvider({ children }: { children: React.ReactNode }) {
  const [newOrder, setNewOrder] = useState(false);
  const [purchase, setPurchase] = useState("");
  const [dataMenu, setDataMenu] = useState<dataMenuType[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenuType[]>([]);

  return (
    <NewOrderContext.Provider
      value={{
        purchase,
        setPurchase,
        newOrder,
        setNewOrder,
        dataMenu,
        setDataMenu,
        selectedMenu,
        setSelectedMenu,
      }}
    >
      {children}
    </NewOrderContext.Provider>
  );
}

export function useNewOrder() {
  const ctx = useContext(NewOrderContext);
  if (!ctx) throw new Error("useFilter must be use with FilterProvider");
  return ctx;
}

export default function NewOrder() {
  const { newOrder, setDataMenu: setRawData, setSelectedMenu } = useNewOrder();
  const [data, setData] = useState<
    {
      category: string;
      menu: dataMenuType[];
    }[]
  >();

  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/admin/menu", {
        credentials: "include",
      }).then((res) => res.json());

      const rawData = res.data as dataMenuType[];
      setRawData(rawData);

      const grouped = Object.values(
        rawData.reduce<
          Record<string, { category: string; menu: dataMenuType[] }>
        >((acc, item) => {
          if (!item.category) return acc;
          if (!acc[item.category]) {
            acc[item.category] = {
              category: item.category,
              menu: [],
            };
          }
          acc[item.category].menu.push(item);
          return acc;
        }, {})
      );
      setData(grouped);
    }

    getData();
  }, [setRawData]);

  if (!data) return <></>;

  return (
    <>
      {newOrder && (
        <div className=" flex flex-col items-center w-full gap-5">
          <div className="self-stretch py-2.5 inline-flex justify-center items-center gap-2.5 overflow-hidden">
            <div className="w-72 px-4 py-1.5 bg-neutral-100 rounded-3xl flex justify-start items-center gap-2.5">
              <IconSearch className=" w-4 text-black/50" />
              <div className="justify-start text-black/50 font-normal ">
                Search
              </div>
            </div>
          </div>
          <div className="self-stretch flex-1 inline-flex justify-start items-start gap-3.5">
            {data.map((item) => (
              <div
                key={item.category}
                className="inline-flex flex-col justify-start items-start gap-2.5"
              >
                <div className="justify-start text-black text-2xl font-normal capitalize ">
                  {item.category}
                </div>
                {item.menu.map((m) => (
                  <div
                    key={m.id}
                    className="w-72 px-3.5 py-[5px] bg-white rounded-2xl shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col justify-center items-start gap-5"
                  >
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="self-stretch flex justify-start items-center gap-2.5">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                          {m.image && (
                            <Image
                              src={m.image}
                              alt={m.name}
                              fill
                              className=" object-cover"
                            />
                          )}
                        </div>
                        <div className="self-stretch inline-flex flex-col justify-center items-start gap-[3px]">
                          <div className="self-stretch h-5 inline-flex justify-start items-center gap-2">
                            <div className="justify-start text-black text-sm font-medium ">
                              {m.name}
                            </div>
                          </div>
                          <div className="justify-start text-black text-sm font-medium ">
                            {formatRupiah(Number(m.price))}
                          </div>
                        </div>
                      </div>
                      <IconAddFill
                        className=" w-7 text-primary"
                        onClick={() =>
                          addSelectedMenu(
                            {
                              ...m,
                              qty: 1,
                              addons: [
                                ...m.addons
                                  .filter((f) => f.level !== "")
                                  .map((a) => ({
                                    ...a,
                                    level: levelParser(a.level)[0],
                                  })),
                              ],
                              variety: [m.variety[0]],
                            },
                            setSelectedMenu
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
