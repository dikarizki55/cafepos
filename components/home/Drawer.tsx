"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type DrawerContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  animate: boolean;
  setAnimate: Dispatch<SetStateAction<boolean>>;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

function useDrawerContext() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer components must be used inside <Drawer>");
  return ctx;
}

export default function Drawer({
  children,
  isOpen: controlledOpen,
  setIsOpen: controlledSetOpen,
  onClose,
  ...rest
}: {
  isOpen?: boolean;
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpenUncontrolled, setIsOpenUncontrolled] = useState(false);
  const isOpen =
    controlledOpen !== undefined ? controlledOpen : isOpenUncontrolled;
  const setIsOpen =
    controlledSetOpen !== undefined ? controlledSetOpen : setIsOpenUncontrolled;

  const [animate, setAnimate] = useState(false);

  const [startTouch, setStartTouch] = useState(0);
  const [startMove, setStartMove] = useState(0);
  const [moveY, setMoveY] = useState(1000);
  const [isFull, setIsFull] = useState(false);
  const [drawerTransition, setDrawerTransition] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setAnimate(true);
    } else {
      document.body.style.overflow = "";
      if (onClose) onClose();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (animate) {
      setMoveY(300);
    } else {
      setDrawerTransition(true);
      setMoveY(1000);
      const handler = setTimeout(() => {
        setIsOpen(false);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [animate, setIsOpen]);

  function handleTouchStart(e: React.TouchEvent<HTMLElement>) {
    setDrawerTransition(false);
    setStartTouch(e.touches[0].clientY);
    setStartMove(moveY);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLElement>) {
    const position = e.touches[0].clientY;
    const diff = startMove + (position - startTouch);
    if (diff > 0) {
      setMoveY(diff);
    }
  }

  function handleTouchEnd() {
    setDrawerTransition(true);
    if (moveY - startMove < -100 || moveY === 0) {
      setMoveY(0);
      setIsFull(true);
    } else if (moveY - startMove > 100) {
      setAnimate(false);
      setIsFull(false);
    } else {
      setMoveY(300);
      setIsFull(false);
    }
  }

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsTop(el.scrollTop < 2);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <DrawerContext.Provider value={{ animate, setAnimate, isOpen, setIsOpen }}>
      <div {...rest}>
        <div onClick={() => setIsOpen(true)} className=" w-full h-full"></div>
        {isOpen &&
          createPortal(
            <div
              className={`w-full h-[100dvh] fixed top-0 z-100 ${
                animate ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"
              } transition-all duration-300`}
            >
              <div
                onClick={() => setAnimate(false)}
                className={` w-full h-screen transition-all duration-300`}
              ></div>
              <div
                style={{ top: moveY }}
                className={`absolute w-full bg-white h-full flex flex-col rounded-t-[30px] overflow-hidden ${
                  drawerTransition ? "transition-all duration-300" : ""
                }`}
                onTouchStart={isTop ? handleTouchStart : undefined}
                onTouchMove={isTop ? handleTouchMove : undefined}
                onTouchEnd={isTop ? handleTouchEnd : undefined}
              >
                <div
                  className=" w-full h-11 flex justify-center items-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className=" w-25 h-1 rounded-full bg-[#e1e1e1]"></div>
                </div>
                <div
                  style={{ WebkitOverflowScrolling: "touch" }}
                  className={`w-full h-full ${
                    isFull ? "overflow-y-scroll" : "overflow-hidden"
                  }`}
                  ref={scrollRef}
                >
                  {children}
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </DrawerContext.Provider>
  );
}

export function DrawerClose({
  children,
  ...rest
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const { setAnimate } = useDrawerContext();
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        setAnimate(false);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
