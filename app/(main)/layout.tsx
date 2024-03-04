import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { SocketOnlineCheck } from "@/components/socket-online-check";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const profile = await currentProfile();

  if (!profile) return redirect("/");

  return (
    <div className="h-full">
      <div className="hidden md:flex flex-col h-full w-[72px] z-30 fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] h-full">{children}</main>
      <SocketOnlineCheck id={profile.id} />
    </div>
  );
};

export default MainLayout;
