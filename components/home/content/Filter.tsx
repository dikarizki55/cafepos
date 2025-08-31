"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export type dataMenuType = {
  price: number;
  addons: {
    price: number;
    name: string;
    id: string;
    created_at: Date;
    updated_at: Date;
    menu_items_id: string;
    level: string;
  }[];
  variety: {
    price: number;
    name: string;
    id: string;
    created_at: Date;
    updated_at: Date;
    menu_items_id: string;
  }[];
  name: string;
  id: string;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  category: string | null;
};

export type serializedData = dataMenuType[];

type FilterContextType = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  dataMenu: serializedData;
  setDataMenu: Dispatch<SetStateAction<serializedData>>;
  rawDataMenu: serializedData;
  setRawDataMenu: Dispatch<SetStateAction<serializedData>>;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [dataMenu, setDataMenu] = useState<serializedData>([]);
  const [rawDataMenu, setRawDataMenu] = useState<serializedData>([]);

  return (
    <FilterContext.Provider
      value={{
        dataMenu,
        setDataMenu,
        rawDataMenu,
        setRawDataMenu,
        search,
        setSearch,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilter must be use with FilterProvider");
  }

  return context;
}

export default function Filter() {
  const [filterCol, setFilterCol] = useState("");
  const [disticnt, setDistinct] = useState<string[]>([]);

  const { setDataMenu, rawDataMenu, setRawDataMenu, search, setSearch } =
    useFilter();

  useEffect(() => {
    const getDistinct = async () => {
      const res = await fetch("/api/admin/menu/distinct/category").then((res) =>
        res.json()
      );

      const order: string[] = res.data;

      const reordered = [
        ...order.filter((item) => item === "Food"),
        ...order.filter((item) => item !== "Food" && item !== "Drink"),
        ...order.filter((item) => item === "Drink"),
      ];

      setDistinct(reordered);
    };

    getDistinct();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch("/api/admin/menu").then((res) => res.json());

      const data: serializedData = res.data;
      const sortedData = data.sort((a, b) => {
        return disticnt.indexOf(a.category!) - disticnt.indexOf(b.category!);
      });
      setRawDataMenu(sortedData);
    };
    getData();
  }, [disticnt, setRawDataMenu]);

  useEffect(() => {
    if (filterCol && rawDataMenu) {
      const filtered = rawDataMenu.filter(
        (item) => item.category === filterCol
      );
      setDataMenu(filtered);
    } else {
      setDataMenu(rawDataMenu);
    }
  }, [filterCol, rawDataMenu, setDataMenu]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (search !== "") {
      setFilterCol("");
      const searchData = rawDataMenu.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );

      setDataMenu(searchData);
    }
  }, [rawDataMenu, search, setDataMenu]);

  return (
    <div className="flex items-center gap-2 overflow-scroll">
      <div
        className={`px-5 py-2.5 ${
          filterCol === "" ? "bg-primary" : "bg-disable"
        } rounded-3xl inline-flex flex-col justify-center items-center gap-2.5 transition-all duration-300`}
        onClick={() => setFilterCol("")}
      >
        <div className="justify-start text-black text-base font-normal ">
          All
        </div>
      </div>
      {disticnt.map((item) => (
        <div
          key={item}
          className={`px-5 py-2.5 ${
            filterCol === item ? "bg-primary" : "bg-disable"
          } rounded-3xl inline-flex flex-col justify-center items-center gap-2.5 transition-all duration-300`}
          onClick={() => setFilterCol(item)}
        >
          <div className="justify-start text-black text-base font-normal ">
            {item}
          </div>
        </div>
      ))}
    </div>
  );
}
