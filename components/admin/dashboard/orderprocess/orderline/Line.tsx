"use client";

import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import OrderCard, { OrderCardType } from "./OrderCard";

export type LineType = {
  refresh: boolean;
  setRefresh: React.Dispatch<SetStateAction<boolean>>;
};

const orderLineContext = createContext<LineType | null>(null);

export function LineProvider({ children }: { children: React.ReactNode }) {
  const [refresh, setRefresh] = useState(false);

  return (
    <orderLineContext.Provider value={{ refresh, setRefresh }}>
      {children}
    </orderLineContext.Provider>
  );
}

export function useLine() {
  const ctx = useContext(orderLineContext);
  if (!ctx) throw new Error("useFilter must be use with FilterProvider");
  return ctx;
}

const statusUrl = "/api/admin/orderprocess/status/";

const lineDefine = {
  unpaid: {
    name: "Unpaid Line",
    url: `${statusUrl}unpaid`,
  },
  paid: {
    name: "Paid Line",
    url: `${statusUrl}paid`,
  },
  process: {
    name: "Process Line",
    url: `${statusUrl}process`,
  },
  ready: {
    name: "Ready Line",
    url: `${statusUrl}ready`,
  },
  done: {
    name: "Done Line",
    url: `${statusUrl}done`,
  },
  cancel: {
    name: "Cancel Line",
    url: `${statusUrl}cancel`,
  },
};

export function Line({
  className,
  status,
}: {
  className?: string;
  status: keyof typeof lineDefine;
}) {
  const { refresh } = useLine();
  const [transaction, setTransaction] = useState<OrderCardType[]>();
  useEffect(() => {
    async function getData() {
      const res = await fetch(lineDefine[status].url, {
        credentials: "include",
      }).then((res) => res.json());

      setTransaction(res.data);
    }

    getData();
  }, [status, refresh]);

  return (
    <div
      className={`self-stretch flex flex-col justify-start items-start gap-2.5 ${className}`}
    >
      <div className="self-stretch justify-start text-black text-2xl font-normal">
        {lineDefine[status].name}
      </div>
      {/* <pre>{JSON.stringify(transaction, null, 2)}</pre> */}
      <div className="self-stretch overflow-scroll inline-flex justify-start items-center gap-5">
        {transaction &&
          transaction.map((item, i) => (
            <OrderCard key={i} status={status} data={item} />
          ))}
      </div>
    </div>
  );
}
