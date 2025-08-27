"use client";
import UserInfo from "@/components/admin/dashboard/UserInfo";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function OrderProcess() {
  const [open, setisOpen] = useState(false);
  const [animate, setanimate] = useState(false);

  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        setanimate(true);
      }, 10);

      return () => clearTimeout(handler);
    }
  }, [open]);

  useEffect(() => {
    if (!animate) {
      const handler = setTimeout(() => {
        setisOpen(false);
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [animate]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setanimate(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div>
      <UserInfo />
      <div onClick={() => setisOpen(true)} className=" cursor-pointer">
        klik this
      </div>

      {open &&
        createPortal(
          <div
            className={` w-full h-screen absolute top-0 left-0  flex justify-center items-center z-100 transition-all duration-500 ${
              animate ? "bg-[#0000005c]" : "bg-[#00000000]"
            }`}
          >
            <div
              className=" w-full h-full absolute"
              onClick={() => setanimate(false)}
            ></div>
            <div
              className={` relative z-10 bg-white rounded-2xl w-100 h-200 transition-all duration-300 ${
                animate ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            >
              test
              <div onClick={() => setanimate(false)}>close</div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
