"use client";
import { Plus, SquarePlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export function CreateRoomForm() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("public");
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableChat, setEnableChat] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!roomName.trim()) {
      toast.error("Room name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          type: roomType,
          settings: {
            enableVideo,
            enableChat,
          },
        }),
      });

      if (!result.ok) {
        throw new Error("Failed to create room");
      }

      // Reset form
      setRoomName("");
      setRoomType("public");
      setEnableVideo(true);
      setEnableChat(true);
      setOpen(false);

      toast.success("Room created successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-md mx-auto flex h-1/2 w-1/2 max-w-xl border border-dashed border-gray-700/50 bg-white shadow-sm transition-colors hover:bg-gray-800/20">
          <Plus className="mr-2 h-4 w-4" />
          Create a Room
        </Button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SquarePlus className="h-5 w-5" />
            Create New Room
          </DialogTitle>
          <DialogDescription>
            Set up a new collaborative workspace for your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name *</Label>
            <Input
              id="roomName"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={isLoading}
            />
            <Label htmlFor="roomDescription">Room Description</Label>
            {/* Bugged, not going down lines */}
            <Textarea
              placeholder="Enter room description"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <div className="flex items-center gap-4">
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              {roomType === "private" && (
                <Input
                  id="password"
                  placeholder="Enter password"
                  type="password"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Room Features</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableVideo" className="text-sm font-normal">
                    Video Calls
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Allow video conferencing in this room
                  </p>
                </div>
                <Switch
                  id="enableVideo"
                  checked={enableVideo}
                  onCheckedChange={setEnableVideo}
                  className="bg-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableChat" className="text-sm font-normal">
                    Text Chat
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Enable text messaging in this room
                  </p>
                </div>
                <Switch
                  id="enableChat"
                  checked={enableChat}
                  onCheckedChange={setEnableChat}
                  className="bg-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="hover:bg-red-600 hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              variant="outline"
              className="hover:border-green-600/80 hover:bg-green-600/80 hover:text-white"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
