import { IconSearch } from "@/components/home/Icon";
import { Line } from "./orderline/Line";
import NewOrder, { useNewOrder } from "./orderline/NewOrder";

export default function OrderLine() {
  const { newOrder } = useNewOrder();
  return (
    <div
      className={`relative w-full h-full px-9 py-6 bg-white rounded-[35px] flex flex-col justify-start items-start gap-3.5 overflow-scroll`}
    >
      {!newOrder && (
        <>
          <div className="self-stretch py-2.5 gap-5 flex justify-between items-center">
            <div className=" overflow-x-scroll flex justify-start items-center gap-2">
              <div className="px-4 py-1.5 bg-primary rounded-full inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Default
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Unpaid
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Paid
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Process
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Ready
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Done
                </div>
              </div>
              <div className="px-4 py-1.5 bg-neutral-100 rounded-3xl inline-flex flex-col justify-center items-center gap-2.5">
                <div className="justify-start text-black text-xs font-normal font-['Inter']">
                  Cancel
                </div>
              </div>
            </div>
            <IconSearch className=" w-5" />
          </div>

          <Line status="cancel" />
          <Line status="done" />
          <Line status="ready" />
          <Line status="process" />
          <Line status="paid" />
          <Line status="unpaid" />
        </>
      )}

      <NewOrder />
    </div>
  );
}
