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

    if (!profile) {
      return res.status(401).json("Unauthorized");
    }

    const { content, fileUrl } = req.body;

    if (!content) {
      return res.status(400).json("Content is missing");
    }

    const querySchema = z.object({
      conversationId: z.string(),
    });

    const queryParsingResult = querySchema.safeParse(req.query);

    if (!queryParsingResult.success) {
      return res.status(400).json("Conversation ID is missing");
    }

    const { conversationId } = queryParsingResult.data;

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: true,
        memberTwo: true,
      },
    });

    if (!conversation) {
      return res.status(404).json("Conversation not found");
    }

    const me =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    const directMessage = await db.directMessage.create({
      data: {
        content,
        fileUrl: fileUrl ?? null,
        conversationId,
        memberId: me.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, directMessage);

    return res.status(201).json(directMessage);
  } catch (error) {
    console.log("[DIRECT_MESSAGE_POST", "Internal Server Error");
    return res.status(500).json(error);
  }
}
