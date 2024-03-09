import { db } from "@/lib/db";
import { UserButton, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import NavigationAction from "./navigation-action";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import NavigationItem from "./navigation-item";
import { ModeToggle } from "../mode-toggle";

export const NavigationSidebar = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const profileWithMember = await db.profile.findUnique({
    where: {
      userId: userId,
    },
    include: {
      members: {
        include: {
          server: true,
        },
      },
    },
  });

  // If the user doesn't belong to any of the servers
  if (!profileWithMember?.members.length) {
    redirect("/");
  }

  const serversThatBelongsTo = profileWithMember.members.map(
    (member) => member.server
  );

  return (
    <div className="h-full w-full flex flex-col space-y-4 text-primary bg-[#E3E5E8] dark:bg-[#1E1F22] py-4">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-12 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {serversThatBelongsTo.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              key={server.id}
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-12 mx-auto" />
      <div className="pb-3 mt-auto flex flex-col items-center gap-y-4">
        <ModeToggle />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-[42px] w-[42px] z-[100]",
            },
          }}
        />
      </div>
    </div>
  );
};

export default NavigationSidebar;
