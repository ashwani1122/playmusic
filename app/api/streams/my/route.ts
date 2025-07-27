import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@/app/generated/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email }
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("user found");
    console.log(PrismaClient)
    const streams = await prismaClient.stream.findMany({
        where: { userId: user.id },
        include: {
        _count: { select: { upvotes: true, downvotes: true } },
        upvotes: { where: { userId: user.id }, select: { streamId: true } },
        downvotes: { where: { userId: user.id }, select: { streamId: true } },

        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,

    });
    const out = streams.map(s => ({
        ...s,
        upvotes: s._count.upvotes,
        downvotes: s._count.downvotes,
        userVoted: s.upvotes.length ? 1 : s.downvotes.length ? -1 : 0,
        url: `https://www.youtube.com/watch?v=${s.extractedId}` ,
        bigThumbnail: s.bigThumbnail,
        smallThumbnail: s.smallThumbnail,
    }));
    return NextResponse.json({ streams: out });
    }
