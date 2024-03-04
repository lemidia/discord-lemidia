import { InitialModal } from "@/components/modals/initial-modal";
import { initialProfile } from "@/lib/initial-profile";
import { Member, Profile } from "@prisma/client";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile: Profile & { members: Member[] } = await initialProfile();

  if (profile?.members.length !== 0) {
    return redirect(`/servers/${profile.members[0].serverId}`);
  }

  return <InitialModal />;
};

export default SetupPage;
