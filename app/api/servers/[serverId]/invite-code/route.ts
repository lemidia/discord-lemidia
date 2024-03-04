import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const PATCH = async (
  req: Request,
  { params }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const server = await db.server.findUnique({
      where: {
        id: params.serverId,
      },
      include: {
        members: true,
      },
    });

    if (!server) return new NextResponse("Server not found", { status: 404 });

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member || member.role === "GUEST") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: params.serverId,
      },
      data: {
        inviteCode: uuidv4(),
      },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
        channels: true,
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("An Error from /api/servers/[serverId]/invite-code ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
