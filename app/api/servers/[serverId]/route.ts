import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params: { serverId } }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    // Parsing the data from the client
    // It's good to add Zod-validation for the data from the client later... (of course the data from the client is sanitized too using react-hook-form)
    const { name, imageUrl } = await req.json();

    // Check if a server to be updated is exists or not
    const existingServer = await db.server.findUnique({
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

    if (!existingServer)
      return new NextResponse("Server Not Found", { status: 404 });

    // Check a user that requesting the api is a member of this server and also is ADMIN or not
    if (
      existingServer.members.length === 0 ||
      existingServer.members[0].role !== "ADMIN"
    )
      return new NextResponse("Unauthorized", { status: 403 });

    // Exception is thrown if record does not exist.
    const server = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("An Error from /api/servers/[serverId] ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params: { serverId } }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    // Check if a server to be updated is exists or not
    const existingServer = await db.server.findUnique({
      where: {
        id: serverId,
      },
    });

    if (!existingServer)
      return new NextResponse("Server Not Found", { status: 404 });

    // Check a user requesting the api is a owner of this server
    if (existingServer.profileId !== profile.id)
      return new NextResponse("Forbidden", { status: 403 });

    // Exception is thrown if record does not exist.
    await db.server.delete({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    return new NextResponse("Deletion Success", { status: 200 });
  } catch (error) {
    console.log("An Error from DELETE /api/servers/[serverId] ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
