import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import qs from "query-string";

export const PATCH = async (
  req: Request,
  { params: { memberId } }: { params: { memberId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const {
      query: { serverId },
    } = qs.parseUrl(req.url);

    if (typeof serverId !== "string")
      return new NextResponse("Bad Request - ServerId is missing", {
        status: 400,
      });

    const { role } = await req.json();

    if (!(role === "GUEST" || role === "MODERATOR")) {
      return new NextResponse(
        "Bad Request - Role Info is missing or incorrect",
        { status: 404 }
      );
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        members: {
          where: {
            OR: [{ id: memberId }, { profileId: profile.id }],
          },
        },
      },
    });

    if (!server) return new NextResponse("Server Not Found", { status: 404 });

    const admin = server.members.find(
      (member) => member.profileId === profile.id
    );

    const userToBeRated = server.members.find(
      (member) => member.id === memberId
    );

    if (!admin || !userToBeRated)
      return new NextResponse("User Not Found", { status: 404 });

    if (admin.role !== "ADMIN" || userToBeRated.role === "ADMIN")
      return new NextResponse("This Behavior is Not Allowed", { status: 403 });

    // Do role change

    const updatedServerInfo = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
        channels: true,
      },
    });

    return NextResponse.json(updatedServerInfo);
  } catch (error) {
    console.log("An Error from PATCH /api/members/[serverId] ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params: { memberId } }: { params: { memberId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId)
      return new NextResponse("Bad Request - ServerId is missing", {
        status: 400,
      });

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        members: {
          where: {
            OR: [{ id: memberId }, { profileId: profile.id }],
          },
        },
      },
    });

    if (!server) return new NextResponse("Server Not Found", { status: 404 });

    const admin = server.members.find(
      (member) => member.profileId === profile.id
    );

    const userToBeDeleted = server.members.find(
      (member) => member.id === memberId
    );

    if (!admin || !userToBeDeleted)
      return new NextResponse("User Not Found", { status: 404 });

    if (admin.role !== "ADMIN" || userToBeDeleted.role === "ADMIN")
      return new NextResponse("This Behavior is Not Allowed", { status: 403 });

    // Do role change

    const updatedServerInfo = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        members: {
          delete: {
            id: memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
        channels: true,
      },
    });

    return NextResponse.json(updatedServerInfo);
  } catch (error) {
    console.log("An Error from DELETE /api/members/[serverId] ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
