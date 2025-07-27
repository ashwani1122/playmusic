import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { GetVideoDetails } from "youtube-search-api";
var YT_REGEX =  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
const CreateStreamSchema = z.object({
        creatorId : z.string(),
        url : z.string()  
});
    export async function POST(req: NextRequest) {
    const data = CreateStreamSchema.parse(await req.json());
    if (!YT_REGEX.test(data.url)) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const extractedId = data.url.match(YT_REGEX)![1];
    const res = await GetVideoDetails(extractedId);
    const thumbs = res.thumbnail.thumbnails;
    thumbs.sort((a:{
        width: number
    }, b:{
        width: number
    }) => a.width - b.width);

    const stream = await prismaClient.stream.create({
        data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        title: res.title ?? "Untitled",
        bigThumbnail: thumbs.pop()?.url ?? "",
        smallThumbnail: thumbs.pop()?.url ?? "",
        active: true,
        },
    });

    return NextResponse.json({ stream });
    }
