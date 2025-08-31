"use client";
import { useEffect, useRef, useState } from "react";
import { IconSearch } from "../Icon";
import { useFilter } from "../content/Filter";

export default function Search() {
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { search, setSearch } = useFilter();

  useEffect(() => {
    if (open) {
      setAnimate(true);
    }
  }, [open]);

  useEffect(() => {
    if (!animate) {
      const handler = setTimeout(() => setOpen(false), 500);
      return () => clearTimeout(handler);
    }
  }, [animate]);

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (search === "") {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setAnimate(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [search]);

  return (
    <div
      className={`flex items-center ${
        animate ? "gap-1 bg-black/5 px-5 py-2 rounded-full" : "gap-0"
      } transition-all duration-300`}
      ref={ref}
    >
      {open && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className={`${animate ? "w-30" : "w-0"} transition-all duration-300`}
        ></input>
      )}
      <IconSearch className=" w-5" onClick={() => setOpen(true)} />

      {/* {open &&
        createPortal(
          <div
            className={`fixed top-0 ${
              animate ? "left-0" : "left-[100vw]"
            } w-full h-screen transition-all duration-300 bg-white`}
          >
            <div onClick={() => setAnimate(false)}>close</div>
          </div>,
          document.body
        )} */}
    </div>
  );
}
