"use client";

import { cn } from "@/lib/utils";
import { useSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  return (
    <Badge
      variant={"outline"}
      className={cn(
        "bg-yellow-600 text-white border-none w-5 h-5 md:w-auto md:h-auto",
        isConnected && "bg-emerald-500 animate-pulse"
      )}
    >
      <span className="hidden md:inline">
        {!isConnected ? "Fallback: Polling every 1s" : "Live: Socket Connected"}
      </span>
    </Badge>
  );
};
