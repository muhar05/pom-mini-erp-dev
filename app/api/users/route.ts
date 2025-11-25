import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.users.findMany(); // modelnya 'users', bukan 'user'
  return Response.json(users);
}
