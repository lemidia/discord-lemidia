import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole, Message } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
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

export const POST = async (req: NextRequest) => {
  try {
    const profile = await currentProfile();

    const { content, fileUrl } = await req.json();

    const querySchema = z.object({
      serverId: z.string(),
      channelId: z.string(),
    });

    const { searchParams } = new URL(req.url);

    const queryParsingResult = querySchema.safeParse({
      serverId: searchParams.get("serverId"),
      channelId: searchParams.get("channelId"),
    });

    if (!queryParsingResult.success) {
      return new NextResponse("Server ID or Channel ID is missing", {
        status: 400,
      });
    }

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new NextResponse("Content is missing", { status: 400 });
    }

    const { serverId, channelId } = queryParsingResult.data;

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          where: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl: fileUrl ?? null,
        channelId,
        memberId: server.members[0].id,
      },
    });

    return new NextResponse("Success", { status: 201 });
  } catch (error) {
    console.log("Server Error at GET /api/mesages", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
