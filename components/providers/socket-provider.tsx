"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  function detectDevice() {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return "phone";
    } else {
      return "computer";
    }
  }

  useEffect(() => {
    // Make socket instance for client.
    // It keep polling to the server.
    // Polling : client socket instance requests socket connection to the server repeatedly each every constant time intervals
    const socketInstance = new (ClientIO as any)(
      detectDevice() === "phone"
        ? "192.168.0.7:3000"
        : process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
      }
    );

    // It fires when socket connection established successfully
    socketInstance.on("connect", () => {
      console.log("socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason: any, details: any) => {
      console.log("socket disconnected");
      console.log(reason);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
