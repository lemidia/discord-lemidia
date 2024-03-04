"use client";

import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";
import { useOnlineUsers } from "@/hooks/use-online-users-store";

type ServerMemberProps = {
  member: Member & { profile: Profile };
  server: Server;
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: ShieldCheck,
  [MemberRole.ADMIN]: ShieldAlert,
};

export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const { onlineUsers } = useOnlineUsers();

  const onlineUser = onlineUsers.find(
    (user) => user.userId === member.profileId
  );

  const Icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group px-2 py-2 rounded-md flex items-center gap-x-3 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className="w-8 h-8 md:h-8 md:w-8"
      />
      <div
        className={`absolute w-[10px] h-[10px] rounded-full top-1.5 left-8 ring-[1.7px] ring-white ${
          onlineUser?.status === "ONLINE"
            ? "bg-emerald-500"
            : onlineUser?.status === "IDLE"
            ? "bg-orange-400"
            : "bg-gray-500"
        }`}
      />
      <p
        className={cn(
          "line-clamp-1 text-left font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.memberId === member.id && "text-primary dark:text-zinc-200"
        )}
      >
        {member.profile.name}
      </p>
      {!!Icon && (
        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            member.role === MemberRole.MODERATOR && "text-indigo-500",
            member.role === MemberRole.ADMIN && "text-rose-500"
          )}
        />
      )}
    </button>
  );
};
