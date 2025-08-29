"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IconEdit, IconTrash } from "../Icon";
import { formatRupiah } from "@/lib/formatRupiah";
import { convertToWebp } from "@/lib/convertToWebp";
import { Prisma } from "@prisma/client";

export default function CreateMenu({
  initial,
}: {
  initial?: Prisma.cafepos_menu_itemsGetPayload<{
    include: { addons: true; variety: true };
  }>;
}) {
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(String(initial?.price || ""));
  const [category, setCategory] = useState(initial?.category || "");

  // Handle Image
  const [preview, setPreview] = useState(initial?.image || "");
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const webpFile = await convertToWebp(e.target.files[0], 1000);
      setPreview(URL.createObjectURL(webpFile));
      setImage(webpFile);
    }
  };

  //   ADDONS

  const defaultAddons = {
    id: "",
    name: "",
    level: "",
    price: "",
    leveladd: false,
  };

  const addonsInitial: (typeof defaultAddons)[] = initial?.addons
    ? initial.addons.map((items) => ({
        id: items.id,
        name: items.name,
        level: items.level,
        price: String(items.price),
        leveladd: items.level !== "",
      }))
    : [];

  const [addons, setAddons] = useState<typeof addonsInitial>(addonsInitial);

  const addAddons = () => {
    setAddons((prev) => [...prev, defaultAddons]);
  };

  const removeAddons = (index: number) => {
    const newArray = addons.filter((_, i) => i !== index);
    setAddons(newArray);
  };

  const handleChangeAddons = (
    index: number,
    option: Partial<typeof defaultAddons>
  ) => {
    setAddons((prev) => {
      const newArray = [...prev];
      newArray[index] = {
        ...newArray[index],
        ...option,
        ...(option.leveladd === false && { level: "" }),
      };
      return newArray;
    });
  };

  //   VARIATION

  const defaultVariations = {
    id: "",
    name: "",
    price: "",
  };

  const variataionsInitial = initial?.variety
    ? initial.variety.map((items) => ({
        id: items.id,
        name: items.name,
        price: String(items.price),
      }))
    : [defaultVariations];

  const [variations, setVariations] =
    useState<typeof variataionsInitial>(variataionsInitial);

  const addVariation = () => {
    setVariations((prev) => [...prev, defaultVariations]);
  };

  const removeVariation = (index: number) => {
    if (variations.length === 1) {
      setVariations([defaultVariations]);
    } else {
      const filtered = variations.filter((_, i) => i !== index);
      setVariations(filtered);
    }
  };

  const handleChangeVariation = (
    index: number,
    option: Partial<typeof defaultVariations>
  ) => {
    setVariations((prev) => {
      const newArray = [...prev];
      newArray[index] = { ...newArray[index], ...option };
      return newArray;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("addons", JSON.stringify(addons));
    formData.append("variations", JSON.stringify(variations));
    if (image) formData.append("image", image);

    const apiUrl = initial
      ? `/api/admin/menu/${initial.id}`
      : `/api/admin/menu`;

    try {
      setisLoading(true);
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.status !== 200) {
        throw new Error("Error");
      }

      window.location.reload();
    } catch {
      setisLoading(false);
      setError("Error");
    }
  };

  return (
    <div>
      <Dialog>
        {initial ? (
          <DialogTrigger className=" w-12.5 h-12.5 bg-disable flex-none rounded-full flex justify-center items-center cursor-pointer">
            <IconEdit className=" text-black w-5" />
          </DialogTrigger>
        ) : (
          <DialogTrigger className="  px-5 py-2 bg-primary rounded-full cursor-pointer">
            Create
          </DialogTrigger>
        )}
        <DialogContent className=" rounded-4xl overflow-scroll max-h-[calc(100vh-60px)]">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit Menu" : "Add Menu"}</DialogTitle>
          </DialogHeader>

          {error && <div>{error}</div>}
          <form className=" flex flex-col gap-3 mt-5" onSubmit={handleSubmit}>
            <label className="font-medium text-base">Name</label>
            <input
              type="text"
              className=" border rounded-full px-5 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label className="font-medium text-base">Image</label>
            <div className=" flex gap-3 w-full">
              {preview !== "" && (
                <div className=" overflow-hidden flex-none rounded-2xl w-12.5 h-12.5 relative">
                  <Image
                    src={preview}
                    alt={"test"}
                    fill
                    className=" w-10 h-10 object-cover"
                  />
                </div>
              )}
              <input
                required={initial ? false : true}
                type="file"
                accept="image/*"
                className=" border rounded-full px-5 py-3 w-full"
                onChange={handleFileChange}
              />
            </div>
            <label className="font-medium text-base">Addons</label>
            {addons.map((item, index) => (
              <div key={index} className=" flex gap-3 w-full">
                <div className=" flex flex-col gap-2 w-full">
                  <input
                    required
                    type="text"
                    className=" border w-full rounded-full px-5 py-3"
                    placeholder={`Addons ${index + 1}`}
                    value={item.name}
                    onChange={(e) =>
                      handleChangeAddons(index, { name: e.target.value })
                    }
                  />
                  {item.leveladd && (
                    <input
                      required
                      type="text"
                      className=" border w-full rounded-full px-5 py-3"
                      placeholder={`1,2,3,4,5 OR 1-5`}
                      value={item.level}
                      onChange={(e) =>
                        handleChangeAddons(index, { level: e.target.value })
                      }
                    />
                  )}
                </div>
                <input
                  required
                  type="number"
                  min={0}
                  value={item.price}
                  onChange={(e) =>
                    handleChangeAddons(index, {
                      price: e.target.value,
                    })
                  }
                  placeholder={`Price`}
                  className=" w-30 h-12.5 border rounded-full px-5 py-3"
                />
                <button
                  className={` w-12.5 h-12.5 ${
                    item.leveladd ? "bg-primary" : "bg-disable"
                  } flex-none rounded-full flex justify-center items-center cursor-pointer`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleChangeAddons(index, { leveladd: !item.leveladd });
                  }}
                >
                  Level
                </button>
                <button
                  className=" w-12.5 h-12.5 bg-disable flex-none rounded-full flex justify-center items-center cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    removeAddons(index);
                  }}
                >
                  <IconTrash className=" text-mywarning w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAddons}
              className="bg-primary px-6 py-3 rounded-full cursor-pointer"
            >
              + Add Addons
            </button>
            <label className="font-medium text-base">Variety</label>
            {variations.map((item, index) => (
              <div key={index} className=" w-full flex gap-3">
                <input
                  required
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleChangeVariation(index, { name: e.target.value })
                  }
                  placeholder={`Variety ${index + 1}`}
                  className=" w-full border rounded-full px-5 py-3"
                />
                <input
                  required
                  min={0}
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleChangeVariation(index, {
                      price: e.target.value,
                    })
                  }
                  placeholder={`Price`}
                  className=" w-30 border rounded-full px-5 py-3"
                />

                <button
                  className=" w-12.5 h-12.5 bg-disable flex-none rounded-full flex justify-center items-center cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    removeVariation(index);
                  }}
                >
                  <IconTrash className=" text-mywarning w-5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariation}
              className="bg-primary px-6 py-3 rounded-full cursor-pointer"
            >
              + Add Variety
            </button>
            <label className="font-medium text-base">Category</label>
            <CategoryInput value={category} setValue={setCategory} />
            <label className="font-medium text-base">Price</label>
            <div className=" w-full flex gap-2 items-center">
              <input
                min={0}
                required
                type="number"
                className=" flex-1 border rounded-full px-5 py-3"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <div>{formatRupiah(price === "" ? 0 : Number(price))}</div>
            </div>
            {!isLoading && (
              <button
                type="submit"
                className=" bg-primary px-6 py-3 mt-4 rounded-full cursor-pointer"
              >
                {initial ? "Edit Menu" : "Add Menu"}
              </button>
            )}
            {isLoading && (
              <div className=" bg-disable px-6 py-3 mt-4 rounded-full">
                Loading...
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CategoryInput = ({
  value,
  setValue,
}: {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}) => {
  const [category, setCategory] = useState<string[]>([]);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch("/api/admin/menu/distinct/category", {
        credentials: "include",
      }).then((res) => res.json());

      setCategory(res.data);
    };

    getData();
  }, []);

  return (
    <div className=" w-full">
      <input
        required
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        type="text"
        className=" flex-1 border rounded-full px-5 py-3 w-full"
      />
      <div className=" flex mt-3">
        {category.map((c) => (
          <button
            key={c}
            onClick={(e) => {
              e.preventDefault();
              setValue(c);
            }}
            className=" bg-disable rounded-full px-4 py-2 cursor-pointer"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};
