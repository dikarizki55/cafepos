"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Admin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    } finally {
      router.push("/admin/dashboard");
    }
  };

  if (isLoading)
    return (
      <div className=" w-full h-screen flex justify-center items-center">
        <h1 className=" font-bold text-6xl">Loading...</h1>
      </div>
    );

  return (
    <div className=" w-full h-screen flex justify-center items-center">
      <div className=" rounded-[15px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] px-10 py-8">
        <h3 className=" font-bold text-center text-2xl">Cafe Pos</h3>
        <form onSubmit={handleSubmit} className=" flex flex-col gap-3 mt-5">
          <label className="font-medium text-base">Username</label>
          <input
            type="text"
            className=" border rounded-full px-5 py-3 w-80"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="font-medium text-base">Password</label>
          <input
            type="password"
            className=" border rounded-full px-5 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className=" bg-primary px-6 py-3 mt-4 rounded-full cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
