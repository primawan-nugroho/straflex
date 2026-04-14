import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { redis } from "@/lib/redis";
import { fetchStravaActivities } from "@/lib/strava";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = `strava:${session.user?.email}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return Response.json(cached);
  }

  const activities = await fetchStravaActivities(
    session.accessToken
  );

  await redis.set(cacheKey, activities, { ex: 300 });

  return Response.json(activities);
}