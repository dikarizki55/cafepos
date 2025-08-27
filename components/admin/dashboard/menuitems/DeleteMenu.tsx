"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IconTrash } from "../Icon";

export const DeleteMenu = ({
  id,
  menuName,
}: {
  id: string;
  menuName: string;
}) => {
  const handleDelete = async () => {
    const res = await fetch(`/api/admin/menu/${id}`, {
      credentials: "include",
      method: "DELETE",
    }).then((res) => res.json());

    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className=" w-12.5 h-12.5 bg-disable flex-none rounded-full flex justify-center items-center cursor-pointer">
        <IconTrash className=" text-mywarning w-5" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your menu
            <span className=" text-black"> &quot;{menuName}&quot;</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className=" cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className=" text-black cursor-pointer"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
