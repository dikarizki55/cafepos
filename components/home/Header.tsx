"use client";

import { useSearchParams } from "next/navigation";
import { IconSearch } from "./Icon";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const searchParams = useSearchParams();

  const table = searchParams.get("table");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!table) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [table]);

  if (!mounted) return null;

  return (
    <div className=" flex flex-col items-center">
      <div className=" mt-4 w-96 h-12 px-5 py-px inline-flex justify-between items-center overflow-hidden">
        <div className="justify-start text-black text-xl font-bold ">
          DikaResto
        </div>
        <IconSearch className=" w-5" />
      </div>

      <div className="w-full px-7 inline-flex justify-between items-center mt-4">
        {!table &&
          createPortal(
            <div className=" font-bold text-3xl text-red-500 z-10 fixed inset-0 w-full h-screen bg-white flex justify-center items-center text-center px-5">
              Please Re-Scan QR to get table number
            </div>,
            document.body
          )}
        {table && (
          <>
            <div className="w-52 inline-flex flex-col justify-start items-start gap-[3px]">
              <div className="self-stretch justify-start text-black text-xl font-normal ">
                What would you like
              </div>
              <div className="self-stretch justify-start text-black text-4xl font-bold ">
                to eat?
              </div>
            </div>
            <div className="w-14 h-14 bg-primary rounded-xl flex flex-col justify-center items-center">
              <div className="justify-start text-black text-xs font-normal ">
                Table
              </div>
              <div className="justify-start text-black text-3xl font-normal leading-7">
                {table}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
