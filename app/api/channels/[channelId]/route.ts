import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export const DELETE = async (
  req: Request,
  { params: { channelId } }: { params: { channelId: string } }
) => {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        server: {
          include: {
            members: {
              where: {
                profileId: profile.id,
              },
            },
          },
        },
      },
    });

    if (!channel) return new NextResponse("Channel Not Found", { status: 404 });

    const member = channel.server.members[0];

    if (!member || member.role === MemberRole.GUEST)
      return new NextResponse("Forbidden", { status: 403 });

    await db.channel.delete({
      where: {
        id: channelId,
      },
    });

    return new NextResponse("Deletion Success", { status: 200 });
  } catch (error) {
    console.log("An Error from DELETE /api/channels/[channelId] ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  { params: { channelId } }: { params: { channelId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, type } = await req.json();

    const nameCheck = z.string().min(1).safeParse(name);
    const typeCheck = z.nativeEnum(ChannelType).safeParse(type);

    if (!nameCheck.success || !typeCheck.success) {
      return new NextResponse(
        "Bad Request - Inaccurate Information Provided ",
        { status: 400 }
      );
    }

    if (name === "general") {
      return new NextResponse("Bad Request - Name cannot be general ", {
        status: 400,
      });
    }

    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        server: {
          include: {
            members: {
              where: {
                profileId: profile.id,
              },
            },
          },
        },
      },
    });

    if (!channel) {
      return new NextResponse("Channel Not Found", { status: 404 });
    }

    if (channel.name === "general") {
      return new NextResponse(
        "Bad Request - General channel cannot be modified",
        {
          status: 400,
        }
      );
    }

    if (
      !channel.server.members[0] ||
      channel.server.members[0].role === MemberRole.GUEST
    ) {
      return new NextResponse("Forbidden - Not Allowed", { status: 403 });
    }

    // Delete a channel
    await db.channel.update({
      where: {
        id: channelId,
      },
      data: {
        name,
        type,
      },
    });

    return new NextResponse(JSON.stringify(channel), { status: 200 });
  } catch (error) {
    // for debugging purposes
    console.log("Internal Server Error - POST /api/channels ", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
