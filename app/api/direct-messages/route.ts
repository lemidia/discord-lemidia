import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const MESSAGE_BATCH = 17;

// query params : cursor, channelId conversationId
export const GET = async (req: Request) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Conversation ID missing", { status: 400 });
    }

    let directMessages: DirectMessage[] = [];

    if (cursor) {
      directMessages = await db.directMessage.findMany({
        where: {
          conversationId: conversationId,
        },
        take: MESSAGE_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      directMessages = await db.directMessage.findMany({
        where: {
          conversationId: conversationId,
        },
        take: MESSAGE_BATCH,
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (directMessages.length === MESSAGE_BATCH) {
      nextCursor = directMessages[MESSAGE_BATCH - 1].id;
    }

    return new NextResponse(
      JSON.stringify({ items: directMessages, nextCursor }),
      {
        status: 200,
      }
    );
  } catch (error) {
    // for debugging purposes
    console.log("Internal server error 500", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const profile = await currentProfile();

    const { content, fileUrl } = await req.json();

    const querySchema = z.object({
      conversationId: z.string(),
    });

    const { searchParams } = new URL(req.url);

    const queryParsingResult = querySchema.safeParse({
      conversationId: searchParams.get("conversationId"),
    });

    if (!queryParsingResult.success) {
      return new NextResponse("ConversationId is missing", {
        status: 400,
      });
    }

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new NextResponse("Content is missing", { status: 400 });
    }

    const { conversationId } = queryParsingResult.data;

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
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

    const me =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    const directMessage = await db.directMessage.create({
      data: {
        content,
        fileUrl: fileUrl ?? null,
        conversationId,
        memberId: me.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return new NextResponse("Success", { status: 201 });
  } catch (error) {
    console.log("Server Error at POST /api/direct-messages", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
