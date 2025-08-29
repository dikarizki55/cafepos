"use client";

import Image from "next/image";
import { formatRupiah } from "@/lib/formatRupiah";
import { Prisma } from "@prisma/client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

type TransactionDetailsType = {
  transactionDetailsId: string;
  setTransactionDetailsId: Dispatch<SetStateAction<string>>;
  items: number;
  setItems: Dispatch<SetStateAction<number>>;
};

const TransactionDetailsContext = createContext<TransactionDetailsType | null>(
  null
);

export function TransactionDetailsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [transactionDetailsId, setTransactionDetailsId] = useState("");
  const [items, setItems] = useState(1);

  return (
    <TransactionDetailsContext.Provider
      value={{ transactionDetailsId, setTransactionDetailsId, items, setItems }}
    >
      {children}
    </TransactionDetailsContext.Provider>
  );
}

export function useTransactionDetails() {
  const ctx = useContext(TransactionDetailsContext);
  if (!ctx) throw new Error("useFilter must be use with FilterProvider");
  return ctx;
}

export default function TransactionDetails() {
  const {
    transactionDetailsId,
    setTransactionDetailsId,
    items: itemsTransaction,
  } = useTransactionDetails();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<Prisma.cafepos_transactionGetPayload<{
    include: {
      transaction_menu_items: {
        include: { addon: true; variety: true; menu_items: true };
      };
    };
  }> | null>();

  useEffect(() => {
    if (transactionDetailsId) {
      const handler = setTimeout(() => {
        setOpen(true);
      }, 10);

      return () => clearTimeout(handler);
    }
  }, [transactionDetailsId]);
  useEffect(() => {
    if (!open) {
      const handler = setTimeout(() => {
        setTransactionDetailsId("");
        setData(null);
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [open, setTransactionDetailsId]);

  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      try {
        const res = await fetch(
          `/api/admin/orderprocess/${transactionDetailsId}`,
          { credentials: "include" }
        ).then((res) => res.json());

        setData(res.data);
        setLoading(false);
      } catch {}
    };

    getData();
  }, [transactionDetailsId]);

  function getTotal(index: number) {
    if (!data) return 0;
    const basePrice = Number(data.transaction_menu_items[index].price);
    const varietyPrice = Number(
      data.transaction_menu_items[index].variety[0].price
    );
    const addonPrice =
      data.transaction_menu_items[index].addon.reduce(
        (total, addon) => total + Number(addon.price),
        0
      ) ?? 0;

    return (
      (basePrice + varietyPrice + addonPrice) *
      Number(data.transaction_menu_items[index].qty)
    );
  }

  function getDate() {
    if (!data) return "";
    const date = new Date(data.created_at);
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });
    const dateDay = date.getDate();

    return `${time} | ${year} ${month} ${dateDay}`;
  }

  return (
    <>
      {transactionDetailsId && (
        <div
          className={`${
            open ? "w-116 opacity-100 h-fit" : "w-0 opacity-0 h-0"
          }  p-5 transition-all duration-300 overflow-y-scroll`}
        >
          <div className="w-full px-5 flex flex-col justify-start items-center gap-7 overflow-hidden bg-white">
            <div className="self-stretch flex flex-col justify-start items-start gap-5">
              <div className=" self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch justify-start text-black text-base font-bold font-['Inter']">
                  Transaction Details
                </div>
                <div className="self-stretch">
                  <div className="justify-start">Transaction ID</div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-[14px] font-bold">
                      {data?.id}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Table
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {data?.table}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Date
                  </div>{" "}
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {getDate()}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Type of Transaction
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {data?.transaction_type}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Status
                  </div>

                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {data?.status}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Nominal
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {formatRupiah(Number(data?.nominal))}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Cash Received
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-normal font-['Inter']">
                      {formatRupiah(Number(data?.cash_received))}
                    </div>
                  </Skeleton>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-normal font-['Inter']">
                    Cash Change
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-red-400 text-base font-normal font-['Inter']">
                      -{formatRupiah(Number(data?.change_amount))}
                    </div>
                  </Skeleton>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-5">
                {loading &&
                  Array.from({ length: itemsTransaction }).map((_, i) => (
                    <div
                      key={i}
                      className="self-stretch flex justify-start items-center gap-2.5"
                    >
                      <Skeleton
                        loading={loading}
                        className="w-14 h-14 relative rounded-lg overflow-hidden bg-disable"
                      />
                      <div className="self-stretch inline-flex flex-col justify-start items-start gap-[3px]">
                        <Skeleton
                          loading={loading}
                          className="w-50 h-4 relative rounded-full bg-disable"
                        />
                        <Skeleton
                          loading={loading}
                          className="w-30 h-4 relative rounded-full bg-disable"
                        />
                      </div>
                    </div>
                  ))}
                {data &&
                  !loading &&
                  data.transaction_menu_items.map((item, index) => (
                    <div
                      key={item.id}
                      className="self-stretch inline-flex justify-between items-start"
                    >
                      <div className="self-stretch flex justify-start items-center gap-2.5">
                        <div className="w-14 h-14 relative rounded-lg overflow-hidden">
                          {item.menu_items.image && (
                            <Image
                              alt={item.name}
                              src={item.menu_items.image}
                              fill
                              className=" object-cover"
                              crossOrigin="anonymous"
                            />
                          )}
                        </div>
                        <div className="self-stretch inline-flex flex-col justify-start items-start gap-[3px]">
                          <div className="self-stretch h-5 inline-flex justify-start items-center gap-2">
                            <div className="justify-start text-black text-base font-medium font-['Inter']">
                              {item.name}
                            </div>
                          </div>
                          <div className="justify-start text-zinc-500 text-xs font-light font-['Inter']">
                            {item.variety[0].name},{" "}
                            {item.addon.map((a) => (
                              <span key={a.id}>
                                {a.name}
                                {a.level && ` ${a.level}`},{" "}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex flex-col justify-between items-end">
                        <div className="inline-flex justify-start items-center gap-2.5">
                          <div className="text-center justify-start text-black text-lg font-medium font-['Inter']">
                            {item.qty.toString()} pcs
                          </div>
                        </div>
                        <div className="justify-start text-black text-base font-medium font-['Inter']">
                          {formatRupiah(getTotal(index))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    Subtotal
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    {formatRupiah(
                      Number(data?.nominal) -
                        Number(data?.service_charge) -
                        Number(data?.tax)
                    )}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    Service Charge
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    {formatRupiah(Number(data?.service_charge))}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    Tax
                  </div>
                  <div className="justify-start text-zinc-500 text-base font-normal font-['Inter']">
                    {formatRupiah(Number(data?.tax))}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-base font-bold font-['Inter']">
                    Total
                  </div>
                  <Skeleton
                    className="bg-disable w-50 h-[17px] rounded-full"
                    loading={loading}
                  >
                    <div className="justify-start text-black text-base font-bold font-['Inter']">
                      {formatRupiah(Number(data?.nominal))}
                    </div>
                  </Skeleton>
                </div>
              </div>
            </div>
            <div
              className=" bg-primary rounded-full w-full text-center py-2 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Skeleton({
  className,
  loading,
  children = <></>,
  ...rest
}: {
  className: string;
  loading: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      {loading ? <div className={className} {...rest}></div> : <>{children}</>}
    </>
  );
}
