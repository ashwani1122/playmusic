import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prismaClient.user.findFirst({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });
  const data = UpvoteSchema.parse(await req.json());
  await prismaClient.downvote.deleteMany({
    where: { userId: user.id, streamId: data.streamId }
  });
  try {
    await prismaClient.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId
      }
    });

    return NextResponse.json({ message: "Upvoted" });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ message: "Already upvoted" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
