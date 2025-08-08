"use client";

import { useRoom } from "@/context/RoomContext";
import { ChatMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Chat() {
  const { socket, room, user } = useRoom();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const message: ChatMessage = {
        id: `${socket.id}-${Date.now()}`,
        text: newMessage,
        sender: user.name || "Anonymous",
        timestamp: new Date().toISOString(),
      };
      socket.emit("send-message", message, room.id);
      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full flex-col rounded-md bg-gray-50">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender === user.name;
          return (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end": isCurrentUser,
                "justify-start": !isCurrentUser,
              })}
            >
              <div
                className={cn("max-w-xs rounded-lg p-2 lg:max-w-md", {
                  "bg-blue-500 text-white": isCurrentUser,
                  "bg-gray-200 text-gray-800": !isCurrentUser,
                })}
              >
                {!isCurrentUser && (
                  <p className="text-xs font-semibold">{message.sender}</p>
                )}
                <p>{message.text}</p>
                <p className="mt-1 text-right text-xs">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center border-t p-2"
      >
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" className="ml-2">
          Send
        </Button>
      </form>
    </div>
  );
}
