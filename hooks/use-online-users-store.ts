import { create } from "zustand";

type UserStatus = "ONLINE" | "IDLE" | "OFFLINE";

export type OnlineUsersType = {
  userId: string;
}[];

type useOnlineUsersType = {
  onlineUsers: OnlineUsersType;
  setOnlineUsers: (data: OnlineUsersType) => void;
};
export const useOnlineUsers = create<useOnlineUsersType>((set) => ({
  onlineUsers: [],
  setOnlineUsers: (data: OnlineUsersType) => set({ onlineUsers: data }),
}));
