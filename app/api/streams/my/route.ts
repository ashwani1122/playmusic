import { prismaClient } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = await prismaClient.user.findFirst({
        where : {
            email : session?.user?.email ?? ""
        }
    })
    console.log("the use is this id "+user?.id)
    if(!user){
        return NextResponse.json({error:"User not found",
            status:404    
        });
    } 
    const streams = await prismaClient.stream.findMany({
        where : {
            userId : user.id,
            active : true
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

    return NextResponse.json({streams:streams});
}