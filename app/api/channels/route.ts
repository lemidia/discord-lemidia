import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { z } from "zod";

export const POST = async (req: Request) => {
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

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("Bad Request - Query String Missing", {
        status: 400,
      });
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
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
      return new NextResponse("Server Not Found", { status: 404 });
    }

    if (
      server.members.length === 0 ||
      server.members[0].role === MemberRole.GUEST
    ) {
      return new NextResponse("Forbidden - Not Allowed", { status: 403 });
    }

    // Create a channel

    const channel = await db.channel.create({
      data: {
        name: name,
        type: type,
        profileId: profile.id,
        serverId: serverId,
      },
    });

    return new NextResponse(JSON.stringify(channel), { status: 201 });
  } catch (error) {
    // for debugging purposes
    console.log("Internal Server Error - POST /api/channels ", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
