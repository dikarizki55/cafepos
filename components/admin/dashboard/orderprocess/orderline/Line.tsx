"use client";

import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import OrderCard, { OrderCardType } from "./OrderCard";
import { HTMLMotionProps, motion } from "motion/react";

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
  wrap = false,
  ...rest
}: {
  className?: string;
  status: keyof typeof lineDefine;
  wrap?: boolean;
} & Omit<HTMLMotionProps<"div">, "ref">) {
  const { refresh } = useLine();
  const [transaction, setTransaction] = useState<OrderCardType[]>();
  const [isFetch, setIsFetch] = useState(false);
  useEffect(() => {
    setIsFetch(false);
    async function getData() {
      const res = await fetch(lineDefine[status].url, {
        credentials: "include",
      }).then((res) => res.json());

      setTransaction(res.data);
      setIsFetch(true);
    }

    getData();
  }, [status, refresh]);

  if (!isFetch) return;

  return (
    <motion.div
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100vh", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`self-stretch flex flex-col justify-start items-start gap-2.5 ${className}`}
      {...rest}
    >
      <div className="self-stretch justify-start text-black text-2xl font-normal">
        {lineDefine[status].name}
      </div>
      {/* <pre>{JSON.stringify(transaction, null, 2)}</pre> */}
      <div
        className={`self-stretch overflow-x-auto ${
          wrap ? " flex-wrap" : ""
        } flex justify-start items-center gap-5`}
      >
        {transaction &&
          transaction.map((item, i) => (
            <OrderCard key={i} status={status} data={item} />
          ))}
      </div>
    </motion.div>
  );
}
