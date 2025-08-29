"use client";

import { formatDate, formatRupiah } from "@/lib/formatRupiah";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DeleteMenu } from "./DeleteMenu";
import CreateMenu from "./CreateMenu";

const head = [
  "No.",
  "Name",
  "Image",
  "Addons",
  "Variety",
  "Price",
  "Category",
  "Date Created",
  "Date Modified",
  "Action",
];

export default function MenuTable() {
  const [resdata, setData] = useState<
    | Prisma.cafepos_menu_itemsGetPayload<{
        include: { addons: true; variety: true };
      }>[]
    | null
  >(null);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch("/api/admin/menu", {
        credentials: "include",
      }).then((res) => res.json());
      setData(res.data);
    };

    getData();
  }, []);

  return (
    <div className=" p-5 w-full bg-white shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] rounded-2xl border overflow-auto">
      <table className=" border-collapse w-full">
        <thead>
          <tr>
            {head.map((head, i) => (
              <th
                key={i}
                className={` p-2 ${
                  head === "Price"
                    ? "text-right pr-8"
                    : head === "Action"
                    ? "text-center"
                    : " text-left"
                }`}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resdata &&
            resdata.map((items, i) => (
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
