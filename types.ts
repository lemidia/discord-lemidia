import { Channel, Member, Profile, Server } from "@prisma/client";

export type ServerWithChannelsAndMembersWithProfiles = Server & {
  channels: Channel[];
} & {
  members: (Member & { profile: Profile })[];
};
