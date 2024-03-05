import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params: { messageId } }: { params: { messageId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    const { content } = await req.json();

    if (!serverId) {
      return new NextResponse("Server id missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel id missing", { status: 400 });
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId as string,
      },
      include: {
        members: true,
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

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.member.profileId === profile.id;

    if (!isMessageOwner) {
      return new NextResponse("Not allowed action", { status: 403 });
    }

    message = await db.message.update({
      where: {
        id: messageId as string,
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
    console.log("Server Error at PATCH /api/messages/[messageId]");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params: { messageId } }: { params: { messageId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!serverId) {
      return new NextResponse("Server id missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel id missing", { status: 400 });
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId as string,
      },
      include: {
        members: true,
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

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.member.profileId === profile.id;
    const isAdmin = message.member.role === MemberRole.ADMIN;
    const isModerator = message.member.role === MemberRole.MODERATOR;

    if (!isMessageOwner && !isAdmin && !isModerator) {
      return new NextResponse("Not allowed action", { status: 403 });
    }

    message = await db.message.update({
      where: {
        id: messageId as string,
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
    console.log("Server Error at DELETE /api/messages/[messageId]");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
