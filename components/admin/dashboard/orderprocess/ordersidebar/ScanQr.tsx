"use client";

import { useEffect, useRef, useState } from "react";
import { IconQR } from "../../Icon";
import { useNewOrder } from "../orderline/NewOrder";
import jsQR from "jsqr";

export default function ScanQr() {
  const { setScanQR } = useNewOrder();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    let animationFrame: number;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("cant access camera", error);
      }
    }

    function tick() {
      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setResult(code.data);
          console.log("QR Code ditemukan:", code.data);
        }
      }
      animationFrame = requestAnimationFrame(tick);
    }

    initCamera();
    tick();

    return () => cancelAnimationFrame(animationFrame);
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
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {result && <p className="mt-4 text-green-600">QR Code: {result}</p>}
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
