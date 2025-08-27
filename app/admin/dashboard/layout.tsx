import { auth } from "@/auth";
import Sidebar from "@/components/admin/dashboard/Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin");
  }
  return (
    <div className=" w-full h-screen flex gap-5 bg-disable">
      <Sidebar />
      {children}
    </div>
  );
}
