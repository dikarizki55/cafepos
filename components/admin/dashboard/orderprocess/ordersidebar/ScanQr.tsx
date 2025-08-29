"use client";

import { useEffect, useRef } from "react";
import { IconQR } from "../../Icon";
import { useNewOrder } from "../orderline/NewOrder";

export default function ScanQr() {
  const { setScanQR } = useNewOrder();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch {}
    }
  }, []);

  return (
    <div className="w-full px-12 bg-white inline-flex flex-col  items-center gap-5">
      <div className="self-stretch inline-flex  items-center gap-2.5">
        <IconQR className="w-7" />
        <div className="  text-2xl font-bold ">Scan QR</div>
      </div>
      <div className="w-96 h-96 px-5 py-3 rounded-3xl border border-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-lg shadow"
        />
      </div>
      <div className="self-stretch h-11 py-2.5 bg-primary rounded-3xl inline-flex justify-center items-center gap-4 cursor-pointer">
        <div className="flex  items-center gap-2.5">
          <div className="   font-bold ">Take QR</div>
        </div>
      </div>
      <div
        className="self-stretch px-5 py-2.5 rounded-3xl outline-1 outline-red-400 flex justify-center items-center cursor-pointer"
        onClick={() => setScanQR(false)}
      >
        <div className=" text-red-400 font-bold">Cancel</div>
      </div>
    </div>
  );
}
