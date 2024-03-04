import { PrismaClient } from "@prisma/client";

// globalThis is not initialized even if nextjs's hot reloaded is performed
declare global {
  var prisma: PrismaClient | undefined;
}

// Every time hot reloaded is performed, new PrismaClient will be initialized.
// In Development, we do not want this behavior to occur.
// So, we declare globalThis which is not affected by hot reloading and assign Prisma client to this globalThis object.
export const db = globalThis.prisma || new PrismaClient();

// Below is only effective on dev environment.
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
