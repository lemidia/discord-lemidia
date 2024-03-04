import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO, Socket } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

let onlineUsers: {
  userId: string;
  socketId: string;
  status: "ONLINE" | "IDLE" | "OFFLINE";
}[] = [];

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on("connection", (socket: Socket) => {
      socket.on("ONLINE", (newUserId) => {
        if (!onlineUsers.some((user) => user.userId === newUserId)) {
          onlineUsers.push({
            userId: newUserId,
            socketId: socket.id,
            status: "ONLINE",
          });
        } else {
          onlineUsers = onlineUsers.map((user) => {
            return user.userId === newUserId
              ? { ...user, socketId: socket.id, status: "ONLINE" }
              : user;
          });
        }
        io.emit("get-users", onlineUsers);
      });

      socket.on("IDLE", (userId) => {
        if (!onlineUsers.some((user) => user.userId === userId)) {
          onlineUsers.push({
            userId: userId,
            socketId: socket.id,
            status: "IDLE",
          });
        } else {
          onlineUsers = onlineUsers.map((user) => {
            return user.userId === userId
              ? { ...user, socketId: socket.id, status: "IDLE" }
              : user;
          });
        }
        io.emit("get-users", onlineUsers);
      });

      socket.on("disconnect", (reason) => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("get-users", onlineUsers);
        console.log(reason);
        console.log(onlineUsers);
      });
    });
  }
  res.end();
};

export default ioHandler;
