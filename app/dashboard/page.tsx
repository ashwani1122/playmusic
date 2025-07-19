"use client";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
// import { set } from "zod";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
export default function Dashboard() {
    const [videoId, setVideoId] = useState("");
    const [url, setUrl] = useState("");
    const [queue, setQueue] = useState<Video[]>([]);

const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
    interface Video {
        id: string;
        title: string;
        upvotes: number;
        downvotes: number;
        SmallThumbnail: string;
        url: string;
        BigThumbnail: string;
        extractedId: string;
    }

    const handler = async () => {
        const res = await fetch("/api/streams", {
        method: "POST",
        body: JSON.stringify({
            creatorId: "c36f3e63-e3a7-4f31-962d-43b637defe09",
            url,
        }),
        });
        if (res.status === 200) {
        const data = await res.json();
        setQueue([...queue, data.stream]);
        setUrl("");
        }
        console.log(res);
        // console.log()
    };
    async function getInfo(){
    const res = await fetch("/api/streams/my", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    const data = await res.json();

    const countsMap: Record<string, number> = {};
    data.streams.forEach((video: Video) => {
        countsMap[video.id] = video.upvotes;
    });

    setUpvoteCounts(countsMap);
}

    useEffect(() => {
        const interval = setInterval(()=>{
            getInfo()
        },10000)
        return () => clearInterval(interval)
    },[])
        
    useEffect(() => {
        if (!url.startsWith("http")) return;
        try {
        const parsedUrl = new URL(url);
        const extractedId = parsedUrl.searchParams.get("v");
        setVideoId(extractedId ?? "");
        } catch {
        }
    }, [url]);
        // function handler2(id : string){
        //     count.map((video :Video) =>{
        //         if(video.id === id){
        //             setCount2(upvoteCounts[video.id])
        //         }
        //     })
        // }
    return (
        <div className="flex flex-col gap-10 items-center text-white bg-black h-screen">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <input
        value={url}
        onChange={(e) =>{
            setUrl(e.target.value)
            }}
        placeholder="Paste YouTube URL"
        type="text"
        className="py-2 px-8 rounded border-2 border-black w-full bg-purple-700"
        />
        <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handler}
            className="px-8 py-2 rounded border-2 border-black w-full bg-purple-700 text-white"
        >
            Submit
        </Button>
        <div className="grid grid-cols-2  gap-10 w-full justify-between">
            <div className="flex flex-col bg-gray-500 text-sm rounded-xl">
            {queue.map((video) => (
            <div key={video.id} className="w-full flex  gap-2 p-4 rounded-xl border-2 border-black">
                <img className="w-40 h-30" src={video.SmallThumbnail} alt={video.title} /> 
                <div>
                <p>{video.title}</p>
                <ArrowUpwardIcon className="text-green-700" onClick={async () =>{
                const res =  await fetch(`/api/streams/upvotes`,
                    {
                    method: "POST",
                    body: JSON.stringify({
                        streamId: video.id
                    }),
                    }
                    )
                console.log(res)
                }
                }
                />
                <p>{upvoteCounts[video.id] ?? 0}</p>

                <ArrowDropDownIcon className="text-red-700" onClick={async () =>{
                const res =  await fetch(`/api/streams/downvotes`,
                    {
                    method: "POST",
                    body: JSON.stringify({
                        streamId: video.id
                    }),
                    }
                    )
                console.log(res)
                }
                }
                />
             
                {/* <p>{video.downvotes}</p> */}
                </div>
            </div>
            ))}
            </div>
            <div className="flex justify-end mr-4">
            {videoId && (
            <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-96 h-96 rounded-xl"
            />
        )}
        </div>   
        </div>
        </div>
        
    );
}
