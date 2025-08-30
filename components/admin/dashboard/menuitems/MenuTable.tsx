"use client";

import { formatDate, formatRupiah } from "@/lib/formatRupiah";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DeleteMenu } from "./DeleteMenu";
import CreateMenu from "./CreateMenu";
import { ArrowUpDown } from "lucide-react";

const columnType = [
  "name",
  "image",
  "addons",
  "variety",
  "price",
  "category",
  "created_at",
  "updated_at",
] as const;

type ColumnType = (typeof columnType)[number];

const head = [
  { name: "No.", className: "" },
  { name: "name", className: "" },
  { name: "image", className: "" },
  { name: "addons", className: "" },
  { name: "variety", className: "" },
  { name: "price", className: "text-right pr-8" },
  { name: "category", className: "" },
  { name: "created_at", className: "" },
  { name: "updated_at", className: "" },
  { name: "action", className: "text-center" },
];

export default function MenuTable() {
  const [resdata, setData] = useState<
    | Prisma.cafepos_menu_itemsGetPayload<{
        include: { addons: true; variety: true };
      }>[]
  >([]);
  const [sortedData, setSortedData] = useState<
    | Prisma.cafepos_menu_itemsGetPayload<{
        include: { addons: true; variety: true };
      }>[]
  >([]);

  const [columnSort, setColumnSort] = useState<ColumnType>("created_at");
  const [asc, setAsc] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch("/api/admin/menu", {
        credentials: "include",
      }).then((res) => res.json());
      setData(res.data);
    };

    getData();
  }, []);

  // useEffect(()=>{
  //   if(columnSort)
  // },[])

  function sortBy(column: ColumnType) {
    if (columnSort !== column) {
      setColumnSort(column);
      setAsc(false);
    } else {
      setAsc(!asc);
    }
  }

  useEffect(() => {
    const sorted = [...resdata].sort((a, b) =>
      String(a[columnSort]).localeCompare(String(b[columnSort]))
    );
    setSortedData(asc ? sorted : sorted.reverse());
  }, [asc, columnSort, resdata]);

  return (
    <div className=" p-5 w-full bg-white shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] rounded-2xl border overflow-auto">
      <table className=" border-collapse w-full">
        <thead>
          <tr>
            {head.map((head, i) => (
              <th
                key={i}
                className={` p-2 capitalize text-left ${head.className} cursor-pointer`}
                onClick={() => {
                  if ((columnType as readonly string[]).includes(head.name))
                    sortBy(head.name as ColumnType);
                }}
              >
                <span className=" flex gap-2">
                  {head.name}
                  {head.name === columnSort && (
                    <ArrowUpDown
                      className="w-3 "
                      style={{ opacity: asc ? "1" : "0.3" }}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData &&
            sortedData.map((items, i) => (
              <tr key={i} className=" border-t">
                <td className=" text-center w-10 px-2">{i + 1}</td>
                <td className=" py-2">{items.name}</td>
                <td className=" px-2">
                  {items.image && (
                    <div className=" relative w-12.5 h-12.5 rounded-2xl my-1 overflow-clip">
                      <Image
                        alt={items.name}
                        src={items.image}
                        fill
                        className=" object-cover "
                      ></Image>
                    </div>
                  )}
                </td>
                <td className=" px-2">
                  {items.addons.map((a) => (
                    <span key={a.id}>
                      {a.name} {a.level} Rp.{String(a.price)},{" "}
                    </span>
                  ))}
                </td>
                <td className=" px-2">
                  {items.variety.map((v) => (
                    <span key={v.id}>
                      {v.name}{" "}
                      {Number(v.price) !== 0 && <>Rp.{String(v.price)}, </>}
                    </span>
                  ))}
                </td>
                <td className=" text-right pr-8 px-2">
                  {formatRupiah(Number(items.price))}
                </td>
                <td className=" px-2">{items.category}</td>
                <td className=" px-2">{formatDate(items.created_at)}</td>
                <td className=" px-2">{formatDate(items.updated_at)}</td>
                <td className=" flex px-2 gap-2 justify-center items-center">
                  <CreateMenu initial={items} />
                  <DeleteMenu id={items.id} menuName={items.name} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
