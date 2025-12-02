import { prisma } from "@/lib/prisma";

interface LogActivityParams {
  userId: number;
  activity: string;
  method?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  oldData?: any;
  newData?: any;
}

export async function logUserActivity({
  userId,
  activity,
  method,
  endpoint,
  ipAddress,
  userAgent,
  oldData,
  newData,
}: LogActivityParams) {
  try {
    await prisma.user_logs.create({
      data: {
        user_id: userId,
        activity,
        method: method || null,
        endpoint: endpoint || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        old_data: oldData || null,
        new_data: newData || null,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
    // Don't throw error to prevent main operation from failing
  }
}
