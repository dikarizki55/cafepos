"use client";

import { User } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserInfo() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const body = await fetch("/api/admin/userinfo", {
          credentials: "include",
        }).then((res) => res.json());

        setData(body.user);
      } catch {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      UserInfo {JSON.stringify(data)} {data?.name}
      <button onClick={() => signOut()} className=" cursor-pointer">
        Logout
      </button>
    </div>
  );
}
