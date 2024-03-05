import { supabase } from "@/lib/supabase-client";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatRealtimeProps = {
  table: string;
  filterId: string;
  queryKey: string;
  type: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatRealtime = ({
  table,
  filterId,
  queryKey,
  type,
}: ChatRealtimeProps) => {
  const queryClient = useQueryClient();

  const filterValue = `${type}Id=eq.${filterId}`;

  useEffect(() => {
    const realtimeInsertHandler = async (payload: any) => {
      let { data: message, error } = await supabase
        .from(table)
        .select(`*, member:Member(*, profile:Profile(*))`)
        .eq("id", payload.new.id)
        .maybeSingle();

      if (error) return;

      if (payload.eventType === "INSERT") {
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
      }

      if (payload.eventType === "UPDATE") {
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
      }
    };

    const myChannel = supabase
      .channel(filterId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: table,
          filter: filterValue,
        },
        realtimeInsertHandler
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: table,
          filter: filterValue,
        },
        realtimeInsertHandler
      )

      .subscribe();

    return () => {
      supabase.removeChannel(myChannel);
    };
  }, []);

  // useEffect(() => {

  // socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
  //   queryClient.setQueryData([queryKey], (oldData: any) => {
  //     if (!oldData || !oldData.pages || oldData.pages.length === 0) {
  //       return oldData;
  //     }
  //     const newPages = oldData.pages.map(
  //       (page: {
  //         items: MessageWithMemberWithProfile[];
  //         nextCursor: string | null | undefined;
  //       }) => {
  //         const items = page.items.map((item) => {
  //           if (item.id === message.id) {
  //             return message;
  //           } else {
  //             return item;
  //           }
  //         });

  //         return { ...page, items };
  //       }
  //     );

  //     return { ...oldData, pages: newPages };
  //   });
  // });

  //   socket.on(addKey, (message: MessageWithMemberWithProfile) => {
  //     queryClient.setQueryData([queryKey], (oldData: any) => {
  //       if (!oldData || !oldData.pages || oldData.pages.length === 0) {
  //         return {
  //           pages: [
  //             {
  //               items: [message],
  //             },
  //           ],
  //         };
  //       }

  //       const newPages = [...oldData.pages];

  //       newPages[0] = {
  //         ...newPages[0],
  //         items: [message, ...newPages[0].items],
  //       };

  //       return {
  //         ...oldData,
  //         pages: newPages,
  //       };
  //     });
  //   });

  // }, [queryClient, updateKey, addKey, queryKey, socket]);
  // };
};
