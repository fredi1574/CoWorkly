"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mx-4 rounded-md bg-red-600 px-2 text-xs text-white hover:bg-red-700"
    >
      Sign out
    </Button>
  );
}
