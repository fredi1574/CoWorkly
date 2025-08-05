import { useRoom } from "@/context/RoomContext";
import ExitRoomButton from "./ExitRoomButton";

export default function RoomHeader() {
  const { room, participants } = useRoom();

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md dark:bg-gray-800">
      <ExitRoomButton />
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {room.name}
      </h1>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Participants: {participants.join(", ")}
      </div>
    </header>
  );
}
