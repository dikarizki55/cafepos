"use client";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import statusAnimation from "@/public/menu/statusAnimation.json";
import { useEffect, useRef, useState } from "react";

const statusArray = ["unpaid", "paid", "process", "ready", "done"];

export default function StatusAnimation({ status }: { status: string }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [looping, setLooping] = useState(false);
  const index = statusArray.indexOf(status);

  function getSegment(index: number) {
    if (index === 0) {
      return { start: 0, middle: 20, end: 113 };
    }

    const start = 113 + (index - 1) * 131;
    return {
      start,
      middle: start + 54,
      end: start + 131,
    };
  }

  const calc = getSegment(index);

  useEffect(() => {
    lottieRef.current?.playSegments([calc.start, calc.middle], true);
    setLooping(true);
  }, [calc.middle, calc.start, status]);

  return (
    <div>
      <Lottie
        className=" w-50"
        animationData={statusAnimation}
        lottieRef={lottieRef}
        loop={false}
        autoplay={false}
        onComplete={() => {
          if (looping) {
            lottieRef.current?.playSegments([calc.middle, calc.end], true);
          }
        }}
      ></Lottie>
    </div>
  );
}
