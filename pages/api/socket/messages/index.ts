import { currentProfile } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json("Method Not Allowed");
  }

  try {
    const profile = await currentProfile(req);

    const { content, fileUrl } = req.body;

    const querySchema = z.object({
      serverId: z.string(),
      channelId: z.string(),
    });

    const queryParsingResult = querySchema.safeParse(req.query);

    if (!queryParsingResult.success) {
      return res.status(400).json("Server ID or Channel ID is missing");
    }

    if (!profile) {
      return res.status(401).json("Unauthorized");
    }

    if (!content) {
      return res.status(400).json("Content is missing");
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

    const message = await db.message.create({
      data: {
        content,
        fileUrl: fileUrl ?? null,
        channelId,
        memberId: server.members[0].id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io.emit(channelKey, message);

    return res.status(201).json(message);
  } catch (error) {
    console.log("[MESSAGE_POST", error);
    return res.status(500).json("Internal Server Error");
  }
}
