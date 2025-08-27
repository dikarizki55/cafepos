import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return session.user.id;
}
