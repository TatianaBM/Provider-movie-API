import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function truncateTables(): Promise<void> {
  await prisma.$executeRaw`DELETE FROM "Movie"`
  await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='Movie'`
  console.log('All tables truncated')
  await prisma.$disconnect()
}