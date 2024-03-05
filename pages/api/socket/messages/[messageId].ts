import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json("Method not allowed");
  }

  try {
    const profile = await currentProfile(req);
    const { messageId, serverId, channelId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json("Unauthorized");
    }

    if (!serverId) {
      return res.status(400).json("Server ID missing");
    }

    if (!channelId) {
      return res.status(400).json("Channel ID missing");
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
      return res.status(404).json("Server not found");
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel) {
      return res.status(404).json("Channel not found");
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json("Member not found");
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
      return res.status(404).json("Message not found");
    }

    const isMessageOwner = message.member.profileId === profile.id;
    const isAdmin = message.member.role === MemberRole.ADMIN;
    const isModerator = message.member.role === MemberRole.MODERATOR;

    if (!isMessageOwner && !isAdmin && !isModerator) {
      return res.status(403).json("Unauthorized to do this action");
    }

    if (req.method === "DELETE") {
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
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(403).json("Unauthorized to do this action");
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
    }

    const updatedKey = `chat:${channelId}:messages:update`;
    res?.socket?.server?.io?.emit(updatedKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
}
