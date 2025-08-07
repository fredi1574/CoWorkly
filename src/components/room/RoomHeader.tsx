import { useRoom } from "@/context/RoomContext";
import { Users } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import ExitRoomButton from "./ExitRoomButton";

export default function RoomHeader() {
  const { room, participants } = useRoom();

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {room.name}
        </h1>
        <HoverCard openDelay={100}>
          <HoverCardTrigger
            asChild
            className="cursor-pointer rounded-full bg-gray-500/40 hover:bg-gray-500"
          >
            <div className="flex items-center gap-2 p-2">
              <Users className="h-4 w-4" />
              Participants
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <ul>
              {participants.map((participant, index) => (
                <li className="mb-2" key={index}>
                  {participant}
                </li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>
      <ExitRoomButton />
    </header>
  );
}
