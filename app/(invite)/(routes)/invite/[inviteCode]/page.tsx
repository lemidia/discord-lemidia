import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type InviteCodePageProps = {
  params: {
    inviteCode: string;
  };
};

const InviteCodePage = async ({
  params: { inviteCode },
}: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) return redirect("/");

  const existingServer = await db.server.findUnique({
    where: {
      inviteCode: inviteCode,
    },
    include: {
      members: {
        where: {
          profileId: profile.id,
        },
      },
    },
  });

  // If there is no such a server having given invite-code then redirect user to "/"
  if (!existingServer) return redirect("/");

  // If a user already have joined at a server
  if (existingServer.members.length !== 0) {
    return redirect(`/servers/${existingServer.id}`);
  }

  // Case : Let user join a server
  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: [{ profileId: profile.id }],
      },
    },
  });

  return redirect(`/servers/${server.id}`);
};

export default InviteCodePage;
