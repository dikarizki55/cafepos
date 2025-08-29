"use client";

import Image from "next/image";
import { SelectedMenuType } from "./Selected";
import { formatRupiah, formatRupiahK } from "@/lib/formatRupiah";
import { IconAdd, IconAddFill, IconCart, IconMinFill } from "../Icon";
import { useEffect, useState } from "react";
import { DrawerClose } from "../Drawer";
import { dataMenuType, serializedData } from "./Filter";

export function levelParser(level: string): string[] {
  if (level.includes(",") && level.includes("-")) return [];
  if (level.split("-").length === 2) {
    const [start, end] = level.split("-").map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
      String
    );
  }

  if (level.includes(",")) return level.split(",");
  return [];
}

export default function EditMenu({
  item,
  edit = false,
  action,
  rawDataMenu,
}: {
  item: SelectedMenuType;
  edit?: boolean;
  action: (value: SelectedMenuType) => void;
  rawDataMenu: serializedData;
}) {
  const [tempSelectMenu, setTempSelectMenu] = useState<SelectedMenuType>();
  const [itemRawData, setItemRawData] = useState<dataMenuType>();

  useEffect(() => {
    const rawdata = rawDataMenu.find((f) => f.id === item.id);
    setItemRawData(rawdata);
    function handleTempSelectMenu(item: dataMenuType) {
      setTempSelectMenu((prev) => {
        if (!prev || prev.id !== item.id) {
          return {
            ...item,
            variety: [item.variety[0]],
            addons: [
              ...item.addons
                .filter((a) => a.level !== "")
                .map((b) => ({ ...b, level: levelParser(b.level)[0] })),
            ],
            qty: 1,
          };
        } else {
          return prev;
        }
      });
    }
    if (!edit) {
      handleTempSelectMenu(item);
    } else {
      setTempSelectMenu(item);
    }
  }, [item, edit, rawDataMenu]);

  function getLevel(addonsId: string) {
    return tempSelectMenu?.addons.find((af) => af.id === addonsId)?.level ?? "";
  }

  function changeLevel(
    addonsId: string,
    // originalLevel: string,
    nextprev: number
  ) {
    const currentLevel = getLevel(addonsId);
    const originalLevel = rawDataMenu
      .flatMap((item) => item.addons)
      .find((a) => a.id === addonsId)?.level;
    if (!originalLevel) return;
    const parsedLevel = levelParser(originalLevel);
    const index = parsedLevel.indexOf(currentLevel) + nextprev;
    if (index >= 0 && index < parsedLevel.length) {
      const result = parsedLevel[index];
      setTempSelectMenu((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          addons: prev.addons.map((a) => ({ ...a, level: result })),
        };
      });
    }
  }

  function handleAddons(a: dataMenuType["addons"][0]) {
    if (tempSelectMenu?.addons.some((s) => s.id === a.id)) {
      const filtered = tempSelectMenu.addons.filter((f) => f.id !== a.id);
      setTempSelectMenu((prev) => {
        if (!prev) return prev;
        return { ...prev, addons: filtered };
      });
    } else {
      setTempSelectMenu((prev) => {
        if (!prev) return prev;
        return { ...prev, addons: [...prev.addons, a] };
      });
    }
  }

  function getTotal(): number {
    if (!tempSelectMenu) return 0;
    const basePrice = Number(tempSelectMenu.price);
    const varietyPrice = Number(tempSelectMenu.variety[0].price);
    const addonPrice =
      tempSelectMenu.addons.reduce(
        (total, addon) => total + Number(addon.price),
        0
      ) ?? 0;

    const qty = tempSelectMenu.qty;

    return (basePrice + varietyPrice + addonPrice) * qty;
  }

  function changeQty(value: number) {
    setTempSelectMenu((prev) => {
      if (!prev) return;
      return {
        ...prev,
        qty: prev.qty + value > 0 ? prev.qty + value : prev.qty,
      };
    });
  }

  return (
    <div className=" px-7 flex flex-col gap-7 pb-15">
      <div className="self-stretch aspect-[3/4] relative rounded-[48px] overflow-hidden">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            sizes="100%"
            fill
            className=" object-cover"
          />
        )}
      </div>
      <div className="w-full inline-flex flex-col justify-start items-center gap-5">
        <div className="self-stretch flex gap-3 justify-between items-center">
          <div className="justify-start text-black text-3xl font-bold ">
            {item.name}
          </div>
          <div className="justify-start text-black text-2xl font-medium ">
            {formatRupiah(item.price)}
          </div>
        </div>
        <div className="self-stretch inline-flex justify-start items-center gap-2 flex-wrap content-center overflow-hidden">
          {itemRawData &&
            itemRawData.variety.map((v) => (
              <div
                className={`px-5 py-2.5 ${
                  v.id === tempSelectMenu?.variety[0].id
                    ? " bg-primary"
                    : " bg-disable"
                } rounded-3xl inline-flex flex-col justify-center items-center gap-2.5`}
                key={v.id}
                onClick={() =>
                  setTempSelectMenu((prev) => {
                    if (!prev) return prev;
                    return { ...prev, variety: [v] };
                  })
                }
              >
                {v.name}
              </div>
            ))}
        </div>
        <div className=" w-full flex flex-col justify-start items-start gap-2.5">
          <div className="justify-start text-black text-xl font-bold ">
            Add more stuff
          </div>
          {itemRawData &&
            itemRawData.addons.map((a) => (
              <div
                key={a.id}
                className="w-full inline-flex justify-between items-center"
              >
                <div className="flex-1 justify-start text-black text-base font-normal ">
                  {a.name}{" "}
                  {a.price > 0 && (
                    <span className=" font-bold">
                      +{formatRupiahK(a.price)}
                    </span>
                  )}
                </div>
                {a.level ? (
                  <div className="w-15 flex justify-between items-center">
                    <IconMinFill
                      className=" w-3.5"
                      onClick={() => changeLevel(a.id, -1)}
                    />
                    <div className="text-lg font-medium ">{getLevel(a.id)}</div>
                    <IconAddFill
                      className=" w-3.5"
                      onClick={() => changeLevel(a.id, +1)}
                    />
                  </div>
                ) : (
                  <div
                    className={`px-2.5 py-1.5 ${
                      tempSelectMenu?.addons.some((s) => s.id === a.id)
                        ? "bg-primary"
                        : "bg-disable"
                    } rounded-3xl flex justify-center items-center gap-1.5`}
                    onClick={() => handleAddons(a)}
                  >
                    {tempSelectMenu?.addons.some((s) => s.id === a.id) ? (
                      <IconAddFill className=" w-3.5" />
                    ) : (
                      <IconAdd className=" w-3.5" />
                    )}
                    <div className="justify-start text-black text-base font-normal ">
                      Add
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <div className=" w-full flex justify-between items-center ">
        <div className="justify-start text-black text-xl font-bold ">Qty</div>
        <div className="w-15 flex justify-between items-center">
          <IconMinFill
            className=" w-3.5"
            onClick={() => {
              changeQty(-1);
            }}
          />
          <div className=" text-black text-lg font-medium ">
            {tempSelectMenu?.qty}
          </div>
          <IconAddFill
            className=" w-3.5"
            onClick={() => {
              changeQty(+1);
            }}
          />
        </div>
      </div>

      {edit ? (
        <div
          className=" w-full px-5 py-2.5 bg-primary rounded-3xl inline-flex justify-between items-center"
          onClick={() => {
            if (tempSelectMenu) action(tempSelectMenu);
          }}
        >
          <div className="flex justify-start items-center gap-2.5">
            <IconCart className="w-5" />
            <div className="justify-start text-black text-base font-bold ">
              Add to cart
            </div>
          </div>
          <div className="justify-start text-black text-xl font-medium ">
            {formatRupiah(getTotal())}
          </div>
        </div>
      ) : (
        <DrawerClose className=" w-full">
          <div
            className=" w-full px-5 py-2.5 bg-primary rounded-3xl inline-flex justify-between items-center"
            onClick={() => {
              if (tempSelectMenu) action(tempSelectMenu);
            }}
          >
            <div className="flex justify-start items-center gap-2.5">
              <IconCart className="w-5" />
              <div className="justify-start text-black text-base font-bold ">
                Add to cart
              </div>
            </div>
            <div className="justify-start text-black text-xl font-medium ">
              {formatRupiah(getTotal())}
            </div>
          </div>
        </DrawerClose>
      )}
    </div>
  );
}
