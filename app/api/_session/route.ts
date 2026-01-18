import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  console.log("Session Data:", session);  
  return new Response(JSON.stringify(session));
}
