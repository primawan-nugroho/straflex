import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  const cached = await redis.get("posts");

  if (cached) {
    return Response.json(cached);
  }

  const posts = await prisma.post.findMany();

  await redis.set("posts", posts, { ex: 60 });

  return Response.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();

  const post = await prisma.post.create({
    data: { title: body.title },
  });

  await redis.del("posts");

  return Response.json(post);
}