import { MobileToggle } from "@/components/mobile-toggle";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type ServerIdLayoutProps = {
  children: React.ReactNode;
  params: {
    serverId: string;
  };
};

const ServerIdLayout = async ({
  children,
  params: { serverId },
}: ServerIdLayoutProps) => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  // If the user is not a member of a server to enter
  // possible reasons are accessing the server using url on the browser or accessing after banned from the server by admin or whoever has that authority.
  if (!server) return redirect("/");

  return (
    <div className="h-full relative">
      <div className="hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed dark:bg-zinc-800">
        <ServerSidebar profile={profile} server={server} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
      <MobileToggle profile={profile} server={server} />
    </div>
  );
};

export default ServerIdLayout;
