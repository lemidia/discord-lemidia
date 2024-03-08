"use client";

import { useEffect } from "react";
import { useOnlineUsers } from "@/hooks/use-online-users-store";
import { supabase } from "@/lib/supabase-client";

type CheckOnlineUsersProps = {
  id: string;
};

export const ManagePresence = ({ id }: CheckOnlineUsersProps) => {
  const { setOnlineUsers } = useOnlineUsers();

  useEffect(() => {
    const userStatus = {
      userId: id,
    };

    const main = supabase.channel("main");

    main
      .on("presence", { event: "sync" }, () => {
        const newState = main.presenceState();
        const presenceArray = Object.values(newState);
        const onlineUsers = presenceArray.map((presence: any) => {
          return { userId: presence[0].userId };
        });

        setOnlineUsers(onlineUsers);
      })
      // .on("presence", { event: "join" }, ({ key, newPresences }) => {
      //   console.log("join", key, newPresences);
      // })
      // .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      //   console.log("leave", key, leftPresences);
      // })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        await main.track(userStatus);
      });

    return () => {
      (async () => {
        await main.untrack();
      })();
    };
  }, []);

  return null;
};
