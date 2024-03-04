"use client";

import { useEffect } from "react";
import { useSocket } from "./providers/socket-provider";
import {
  OnlineUsersType,
  useOnlineUsers,
} from "@/hooks/use-online-users-store";

type SocketOnlineCheckProps = {
  id: string;
};

export const SocketOnlineCheck = ({ id }: SocketOnlineCheckProps) => {
  const { socket, isConnected } = useSocket();
  const { setOnlineUsers } = useOnlineUsers();

  useEffect(() => {
    if (isConnected) {
      if (document.hasFocus()) {
        socket?.emit("ONLINE", id);
      } else {
        socket?.emit("IDLE", id);
      }
    }

    const listener = (users: OnlineUsersType) => {
      setOnlineUsers(users);
    };

    // Attach listener to retrieve online users
    socket?.on("get-users", listener);

    const onWindowFocus = () => {
      socket?.emit("ONLINE", id);
    };

    const onWindowBlur = () => {
      socket?.emit("IDLE", id);
    };

    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    // remove listener
    return () => {
      socket?.off("get-users", listener);

      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [socket, isConnected, id]);

  return null;
};
