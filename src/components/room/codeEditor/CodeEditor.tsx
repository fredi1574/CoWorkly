import { useRoom } from "@/context/RoomContext";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CodeEditor() {
  const { socket, room } = useRoom();
  const [code, setCode] = useState("// Loading code...");

  const isUpdatingFromSocket = useRef(false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleCodeHistory = (history: string) => {
      isUpdatingFromSocket.current = true;
      setCode(history);
    };

    const handleCodeChange = (newCode: string) => {
      console.log(`CLIENT: Received code change: ${newCode}`);
      isUpdatingFromSocket.current = true;
      setCode(newCode);
    };

    socket.on("code-history", handleCodeHistory);
    socket.on("server-code-change", handleCodeChange);

    socket.emit("get-code-history", room.id);

    return () => {
      socket.off("code-history", handleCodeHistory);
      socket.off("server-code-change", handleCodeChange);
    };
  }, [socket, room.id]);

  const onChange = useCallback(
    (value: string) => {
      // If the update came from the socket, do nothing
      if (isUpdatingFromSocket.current) {
        isUpdatingFromSocket.current = false;
        return;
      }

      // Otherwise, update the local state and emit the update to the server
      setCode(value);
      socket?.emit("client-code-change", value, room.id);
    },
    [socket, room.id],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-shrink-0 rounded-t-lg border-b bg-gray-100 p-2">
        <h3 className="text-sm font-semibold">Shared Code Editor</h3>
      </div>
      <div className="relative flex-1 overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          theme={vscodeDark}
          extensions={[javascript({ jsx: true, typescript: true })]}
          onChange={onChange}
          className="absolute top-0 left-0 h-full w-full"
        />
      </div>
    </div>
  );
}
