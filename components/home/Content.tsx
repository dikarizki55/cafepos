"use client";

import Image from "next/image";
import { IconAdd, IconAddFill } from "./Icon";
import { AnimatePresence, motion } from "motion/react";
import Filter, { useFilter } from "./content/Filter";
import Drawer from "./Drawer";
import { formatRupiahK } from "@/lib/formatRupiah";
import Selected, { addSelectedMenu, useSelected } from "./content/Selected";
import { useEffect, useState } from "react";
import EditMenu from "./content/EditMenu";

export default function Content() {
  const { dataMenu } = useFilter();
  const { selectedMenu, setSelectedMenu } = useSelected();

  // add tempdata for dev
  // useEffect(() => {
  //   if (dataMenu.length > 0) {
  //     setSelectedMenu([
  //       { ...dataMenu[0], qty: 3 },
  //       {
  //         ...dataMenu[1],
  //         qty: 2,
  //         addons: [
  //           ...dataMenu[1].addons.filter((a) => a.level === ""),
  //           ...dataMenu[1].addons.filter((a) => a.level !== ""),
  //         ].map((e) => ({ ...e, level: levelParser(e.level)[4] })),
  //       },
  //     ]);
  //   }
  // }, [dataMenu, setSelectedMenu]);

  const [addedMenu, setAddedMenu] = useState(false);

  function levelParser(level: string): string[] {
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

  useEffect(() => {
    if (addedMenu) {
      const handler = setTimeout(() => {
        setAddedMenu(false);
      }, 1000);

      return () => clearTimeout(handler);
    }
  }, [addedMenu]);

  return (
    <div className=" w-full px-7 mt-8">
      <Filter />
      <div className="w-full h-36 relative bg-primary rounded-[29px] overflow-hidden mt-7 flex">
        <div className="flex-1 p-6 flex flex-col justify-start items-start gap-1.5">
          <div className="px-2.5 py-1 bg-white rounded-[29px] inline-flex justify-center items-center gap-2.5">
            <div className="justify-start text-black text-base font-black ">
              25%
            </div>
          </div>
          <div className="self-stretch justify-start text-black text-sm font-normal ">
            Special Offer
          </div>
          <div className="justify-start text-black text-2xl whitespace-nowrap font-bold ">
            Beef Burger
          </div>
        </div>
        <div className="pr-3 w-36 h-36 relative">
          <Image
            fill
            sizes="100%"
            className="object-contain"
            alt="burger"
            src="/menu/special.png"
          />
        </div>
      </div>
      <div className=" grid grid-cols-2 gap-4 mt-4 mb-25">
        <AnimatePresence mode="popLayout">
          {dataMenu &&
            dataMenu.map((item) => (
              <motion.div
                layoutId={item.id}
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 300, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={item.name}
                className=" w-full aspect-[3/4] relative rounded-3xl overflow-hidden "
              >
                <Drawer className=" absolute z-1 w-full h-full top-0 left-0">
                  <EditMenu
                    item={{ ...item, qty: 1 }}
                    action={(tempselected) => {
                      addSelectedMenu(tempselected, setSelectedMenu);
                    }}
                  />
                </Drawer>
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="100%"
                    className=" object-cover"
                  />
                )}
                <div className=" absolute bottom-3 w-full px-2 flex justify-center">
                  <div className="w-full px-2 py-1 bg-primary rounded-3xl flex justify-between items-center">
                    <div className=" flex-1 flex justify-start items-center gap-2">
                      {selectedMenu.some((s) => s.id === item.id) ? (
                        <IconAddFill className=" w-3.5" />
                      ) : (
                        <IconAdd className=" w-3.5" />
                      )}
                      <div className="justify-start text-[10px] text-black font-bold">
                        {item.name}
                      </div>
                    </div>
                    <div className="justify-start text-black text-[10px] font-bold  leading-[1px]">
                      {formatRupiahK(item.price)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      <Selected />
    </div>
  );
}
