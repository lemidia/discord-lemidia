import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }
        const newPages = oldData.pages.map(
          (page: {
            items: MessageWithMemberWithProfile[];
            nextCursor: string | null | undefined;
          }) => {
            const items = page.items.map((item) => {
              if (item.id === message.id) {
                return message;
              } else {
                return item;
              }
            });

            return { ...page, items };
          }
        );

        return { ...oldData, pages: newPages };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newPages = [...oldData.pages];

        newPages[0] = {
          ...newPages[0],
          items: [message, ...newPages[0].items],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });
    });

    return () => {
      socket.off(updateKey);
      socket.off(addKey);
    };
  }, [queryClient, updateKey, addKey, queryKey, socket]);
};
