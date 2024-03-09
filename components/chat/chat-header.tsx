import { Hash } from "lucide-react";
import { UserAvatar } from "../user-avatar";
import { ChatVideoButton } from "./chat-video-button";

type ChatHeaderProps = {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
};

export const ChatHeader = ({ name, type, imageUrl }: ChatHeaderProps) => {
  return (
    <div className="text-md font-bold pr-3 pl-12  flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 md:px-3">
      {type === "channel" && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} className="h-7 w-7 md:h-7 md:w-7 mr-3" />
      )}
      <p className="font-semibold text-md text-black dark:text-white">{name}</p>
      <div className="ml-auto flex items-center">
        {type === "conversation" && <ChatVideoButton />}
      </div>
    </div>
  );
};
