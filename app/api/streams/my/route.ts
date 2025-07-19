import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
export async function GET(req: NextRequest) {
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where : {
            email : session?.user?.email ?? ""
        }
    })
    if(!user){
        return NextResponse.json({error:"User not found",
            status:400
        });
    } 
    const streams = await prismaClient.stream.findMany({
        where : {
            userId : user.id
        },
        include:{
            _count:{
                select:{
                    Upvotes:true,
                }
            },
            Upvotes:{
                where:{
                    userId : user.id
                }
            }
        }
    })
    return NextResponse.json({
        streams: streams.map(({_count , ...rest}) => ({
            ...rest,
            upvotes : _count.Upvotes,
            haveUpvotes : rest.Upvotes.length ? true : false,
        }))
    });
}