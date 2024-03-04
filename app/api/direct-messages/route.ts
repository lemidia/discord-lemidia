import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

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
