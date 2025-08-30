"use client";

import { useRef, useState } from "react";
import { IconQR } from "../../Icon";
import { useNewOrder } from "../orderline/NewOrder";
import jsQR from "jsqr";

export default function ScanQr() {
  const { scanQr, setScanQR, setPurchase, setNewOrder } = useNewOrder();
  const [running, setRunning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string | null>(null);

  async function startCamera() {
    setRunning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setInterval(() => {
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

          if (code && code.data !== "") {
            setResult(String(code.data.split("/").pop()));
            console.log("QR Code ditemukan:", code.data);
            stopCamera();
          }
        }
      }, 1000); // ambil setiap 1 detik
    } catch (error) {
      console.error("Tidak bisa akses kamera", error);
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;

      setRunning(false);
    }
  }

  return (
    <>
      {scanQr && (
        <div className="w-full px-12 bg-white inline-flex flex-col  items-center gap-5">
          <div className="self-stretch inline-flex  items-center gap-2.5">
            <IconQR className="w-7" />
            <div className="  text-2xl font-bold ">Scan QR</div>
          </div>
          <div
            className={`relative rounded-3xl overflow-clip ${
              running ? " w-96 h-96" : " w-0 h-0"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className=" w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {result && (
            <p className=" font-bold ">
              Transaction Id: <br /> {result}
            </p>
          )}
          {result && (
            <>
              <div
                className="self-stretch h-11 py-2.5 bg-primary rounded-3xl inline-flex justify-center items-center gap-4 cursor-pointer font-bold"
                onClick={() => {
                  setPurchase(result);
                  setScanQR(false);
                  setNewOrder(false);
                }}
              >
                Open
              </div>
              <div
                className="self-stretch h-11 py-2.5 border border-black rounded-3xl inline-flex justify-center items-center gap-2 cursor-pointer font-bold"
                onClick={() => {
                  setResult("");
                  startCamera();
                }}
              >
                <IconQR className=" w-4" />
                Retake
              </div>
            </>
          )}
          {!result && !running && (
            <div
              className="self-stretch h-11 py-2.5 bg-primary rounded-3xl inline-flex justify-center items-center gap-4 cursor-pointer font-bold"
              onClick={() => {
                startCamera();
              }}
            >
              Take QR
            </div>
          )}
          <div
            className="self-stretch px-5 py-2.5 rounded-3xl outline-1 outline-red-400 flex justify-center items-center cursor-pointer"
            onClick={() => {
              stopCamera();
              setScanQR(false);
            }}
          >
            <div className=" text-red-400 font-bold">Cancel</div>
          </div>
        </div>
      )}
    </>
  );
}
