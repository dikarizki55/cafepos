"use client";

import { useState } from "react";
import { IconFood, IconList, IconLogout, IconSettings } from "./Icon";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isCollapse, setIsCollapse] = useState(true);

  const pathname = usePathname();
  const pageName = pathname.split("/")[3];

  return (
    <div
      className={`${
        isCollapse ? "w-[70px]" : "w-52"
      } flex-none h-screen px-4 py-8 bg-white rounded-tr-[35px] rounded-br-[35px] inline-flex flex-col justify-between items-center overflow-hidden transition-all duration-500`}
      onMouseEnter={() => {
        setIsCollapse(false);
      }}
      onMouseLeave={() => setIsCollapse(true)}
    >
      <div className="self-stretch flex flex-col justify-start items-center gap-10">
        <div
          className={`${
            isCollapse ? "-ml-1.5" : "ml-0"
          } self-stretch inline-flex justify-start items-center gap-3 transition-all duration-500`}
        >
          <div className=" flex-none w-12 h-12 p-2.5 bg-neutral-100 rounded-[100px] flex justify-center items-center gap-2.5">
            <div className="justify-start text-black text-lg font-medium ">
              DR
            </div>
          </div>
          <div className="justify-start text-black text-lg font-medium ">
            DikaResto
          </div>
        </div>
        <div className=" self-stretch flex flex-col gap-4">
          <Link
            href={"/admin/dashboard/orderprocess"}
            className={`${
              pageName === "orderprocess" ? "bg-primary" : "bg-disable"
            } self-stretch overflow-hidden h-9 px-4 py-2 bg-amber-300 rounded-3xl inline-flex justify-start items-center gap-3 transition-all duration-500`}
          >
            <IconFood
              className={`${
                isCollapse ? "-ml-1.5" : "ml-0"
              } w-4.5 h-4.5 text-black flex-none transition-all duration-500`}
            />
            <div className="justify-start text-black text-base font-medium  whitespace-nowrap">
              Order Process
            </div>
          </Link>
          <Link
            href={"/admin/dashboard/menuitems"}
            className={`${
              pageName === "menuitems" ? "bg-primary" : "bg-disable"
            } self-stretch overflow-hidden h-9 px-4 py-2 bg-amber-300 rounded-3xl inline-flex justify-start items-center gap-3 transition-all duration-500`}
          >
            <IconList
              className={`${
                isCollapse ? "-ml-1.5" : "ml-0"
              } w-4.5 h-4.5 text-black flex-none transition-all duration-500`}
            />
            <div className="justify-start text-black text-base font-medium  whitespace-nowrap">
              Menu Items
            </div>
          </Link>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-center gap-5">
        <Link
          href={"/admin/dashboard/settings"}
          className={`${
            pageName === "settings" ? "bg-primary" : "bg-disable"
          } self-stretch overflow-hidden h-9 px-4 py-2 bg-amber-300 rounded-3xl inline-flex justify-start items-center gap-3 transition-all duration-500`}
        >
          <IconSettings
            className={`${
              isCollapse ? "-ml-1.5" : "ml-0"
            } w-4.5 h-4.5 text-black flex-none transition-all duration-500`}
          />
          <div className="justify-start text-black text-base font-medium whitespace-nowrap">
            Settings
          </div>
        </Link>
        <div className="self-stretch px-4 py-2 bg-neutral-100 rounded-3xl inline-flex justify-start items-center gap-3 overflow-hidden">
          <IconLogout
            className={`${
              isCollapse ? "-ml-1.5" : "ml-0"
            } w-4.5 h-4.5 text-mywarning flex-none transition-all duration-500`}
          />
          <div
            onClick={() => signOut()}
            className="justify-start text-mywarning text-base font-medium  whitespace-nowrap cursor-pointer"
          >
            Log Out
          </div>
        </div>
      </div>
    </div>
  );
}
