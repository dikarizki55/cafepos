import CreateMenu from "@/components/admin/dashboard/menuitems/CreateMenu";
import MenuTable from "@/components/admin/dashboard/menuitems/MenuTable";

export default function MenuItems() {
  return (
    <div className="w-full h-full bg-white rounded-[35px] p-10">
      <div className=" overflow-auto w-full h-full flex flex-col items-start  gap-10">
        <CreateMenu />
        <MenuTable />
      </div>
    </div>
  );
}
