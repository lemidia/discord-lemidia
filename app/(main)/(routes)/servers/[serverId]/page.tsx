import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const serverIdPage = async ({
  params: { serverId },
}: {
  params: { serverId: string };
}) => {
  const profile = await currentProfile();

  if (!profile) return redirect("/");

  const channel = await db.channel.findFirst({
    where: {
      serverId,
      name: "general",
    },
  });

  if (!channel) {
    return <div className="">There should be a general channel!!!</div>;
  }

  return redirect(`/servers/${serverId}/channels/${channel.id}`);
};

export default serverIdPage;
