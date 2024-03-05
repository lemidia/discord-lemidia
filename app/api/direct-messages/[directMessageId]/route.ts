import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params: { directMessageId } }: { params: { directMessageId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Conversation id missing", { status: 400 });
    }

    const { content } = await req.json();

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = directMessage.member.profileId === profile.id;

    if (!isMessageOwner) {
      return new NextResponse("Not allowed action", { status: 403 });
    }

    directMessage = await db.directMessage.update({
      where: {
        id: directMessageId as string,
      },
      data: {
        content,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("Server Error at PATCH /api/direct-messages/[directMessageId]");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params: { directMessageId } }: { params: { directMessageId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Conversation id missing", { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = directMessage.member.profileId === profile.id;
    const isAdmin = directMessage.member.role === MemberRole.ADMIN;
    const isModerator = directMessage.member.role === MemberRole.MODERATOR;

    if (!isMessageOwner && !isAdmin && !isModerator) {
      return new NextResponse("Not allowed action", { status: 403 });
    }

    directMessage = await db.directMessage.update({
      where: {
        id: directMessageId as string,
      },
      data: {
        fileUrl: null,
        content: "This is message has been deleted.",
        deleted: true,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log(
      "Server Error at DELETE /api/direct-messages/[directMessageId]"
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
