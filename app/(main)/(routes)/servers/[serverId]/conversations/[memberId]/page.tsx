import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type MemberIdPageProps = {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: { video?: boolean };
};
const MemberIdPage = async ({
  params: { memberId, serverId },
  searchParams,
}: MemberIdPageProps) => {
  const profile = await currentProfile();
  if (!profile) return redirect("/");

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) redirect("/");

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId
  );

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />
      {!searchParams.video && (
        <>
          {" "}
          <ChatMessages
            name={otherMember.profile.name}
            member={currentMember}
            chatId={conversation.id}
            apiUrl={"/api/direct-messages"}
            socketUrl={"/api/direct-messages"}
            socketQuery={{ conversationId: conversation.id }}
            paramKey={"conversationId"}
            paramValue={conversation.id}
            type={"conversation"}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/direct-messages"
            query={{ conversationId: conversation.id }}
          />
        </>
      )}
      {searchParams.video && <MediaRoom chatId={conversation.id} video audio />}
    </div>
  );
};

export default MemberIdPage;
