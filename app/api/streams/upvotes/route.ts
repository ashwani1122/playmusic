import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";

const CreateUpvoteSchema = z.object({
    streamId: z.string(),
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findFirst({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    try {
        const data = CreateUpvoteSchema.parse(await req.json());

        await prismaClient.upvote.create({
            data: {
                userId: user.id,
                streamId: data.streamId
            }
        });

        return NextResponse.json({ message: "Upvote created successfully" });
    } catch (error: any) {
        console.error("Error while upvoting:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "You already upvoted this stream." }, { status: 409 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid data", issues: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
