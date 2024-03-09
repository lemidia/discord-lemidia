import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import NavigationSidebar from "./navigation/navigation-sidebar";
import { ServerSidebar } from "./server/server-sidebar";
import { Profile } from "@prisma/client";
import { ServerWithChannelsAndMembersWithProfiles } from "@/types";

type MobileToggleProps = {
  profile: Profile;
  server: ServerWithChannelsAndMembersWithProfiles;
};

export const MobileToggle = ({ profile, server }: MobileToggleProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="md:hidden absolute top-[3.5px] left-[6px] dark:hover:bg-zinc-700"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0 flex gap-0" hideCloseButton>
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        <ServerSidebar profile={profile} server={server} />
      </SheetContent>
    </Sheet>
  );
};
