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
        members: {
          where: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) return new NextResponse("Server not found", { status: 404 });

    // If a user is not the member or is the creator of this server then
    if (server.members.length === 0 || server.profileId === profile.id) {
      return new NextResponse("Bad Request - ", { status: 400 });
    }

    await db.server.update({
      where: {
        id: params.serverId,
      },
      data: {
        members: {
          delete: {
            id: server.members[0].id,
          },
        },
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("An Error from /api/servers/[serverId]/leave ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
