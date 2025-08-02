"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function CreateRoomForm() {
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCreateRoom = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!roomName) return;

    setIsLoading(true);
    try {
      const result = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });

      if (!result.ok) {
        throw new Error("Failed to create room");
      }

      setRoomName("");
      toast.success("Room has been created");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateRoom}
      className="flex flex-col gap-4 rounded-lg border bg-white p-4 dark:bg-gray-800"
    >
      <Input
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
}
