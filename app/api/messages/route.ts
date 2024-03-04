import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole, Message } from "@prisma/client";
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
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        where: {
          channelId: channelId,
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
      messages = await db.message.findMany({
        take: MESSAGE_BATCH,
        where: {
          channelId: channelId,
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
    }

    let nextCursor = null;

    if (messages.length === MESSAGE_BATCH) {
      nextCursor = messages[MESSAGE_BATCH - 1].id;
    }

    return new NextResponse(JSON.stringify({ items: messages, nextCursor }), {
      status: 200,
    });
  } catch (error) {
    // for debugging purposes
    console.log("Internal server error 500", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
