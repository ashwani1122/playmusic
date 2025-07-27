"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ShareIcon from "@mui/icons-material/Share";
import clsx from "clsx";
import { useSession } from "next-auth/react";
interface Video {
    id: string;
    title: string;
    upvotes: number;
    downvotes: number;
    smallThumbnail: string;
    extractedId: string;
    url: string;
    bigThumbnail: string;
    }

    export default function DashboardClient() {
    const [url, setUrl] = useState("");
    const [queue, setQueue] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [userVoted, setUserVoted] = useState<Record<string, 1 | -1>>({});
    const { data: session } = useSession();
    
   
    const refreshQueue = useCallback(async () => {
        const res = await fetch("/api/streams/my");
        if (!res.ok) return;
        const { streams } = await res.json();
        const sorted = [...streams].sort(
        (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
        setQueue(sorted);
        setCurrentVideo(sorted[0]);
    }, []);

    useEffect(() => {
        refreshQueue();
        const iv = setInterval(refreshQueue, 10000);
        return () => clearInterval(iv);
    }, [refreshQueue]);

    const handleVote = async (id: string, type: "up" | "down") => {
        if (userVoted[id] === (type === "up" ? 1 : -1)) return;

        await fetch(`/api/streams/${type === "up" ? "upvotes" : "downvotes"}`, {
        method: "POST",
        body: JSON.stringify({ streamId: id }),
        });

        setQueue(q =>
        q.map(v => {
            if (v.id === id) {
            return {
                ...v,
                upvotes: v.upvotes + (type === "up" ? 1 : 0),
                downvotes: v.downvotes + (type === "down" ? 1 : 0),
            };
            }
            return v;
        })
        );
        setUserVoted(v => ({ ...v, [id]: type === "up" ? 1 : -1 }));
        setQueue(q => {
        const sorted = [...q].sort(
            (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
        setCurrentVideo(sorted[0]);
        return sorted;
        });
    };
    const handleSubmit = async () => {
        if (!url.startsWith("https")) return;
        if(!session?.user?.id) return;
        const  res = await fetch(`/api/streams`, {
        method: "POST", 
        body: JSON.stringify({
            creatorId:session.user.id,
            url,
        }),
        });
        setUrl("");
        refreshQueue();
    };

    const playNext = () => {
        const idx = queue.findIndex(v => v.id === currentVideo?.id);
        setCurrentVideo(queue[idx + 1] ?? null);
    };

    const share = () => {
        if (!currentVideo) return;
        const link = new URL(window.location.href);
        link.searchParams.set("play", currentVideo.id);
        navigator.clipboard.writeText(link.toString());
        alert("Share link copied!");
    };

    return (
        <div className="flex h-screen bg-black text-white">
        <div className="w-1/3 p-6 overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Up Next</h2>

            <div className="mb-4">
            <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Paste YouTube URL"
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
            <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                className="mt-2 w-full"
            >
                Add Video
            </Button>
            </div>

            <ul className="space-y-3">
            {queue.map((vid, i) => {
                const net = (vid.upvotes - vid.downvotes) || 0;
                return (
                <li
                    key={vid.id}
                    className={clsx(
                    "flex items-center space-x-3 p-3 bg-gray-700 rounded transition-all duration-300",
                    currentVideo?.id === vid.id && "scale-105 bg-gray-600"
                    )}
                >
                    <img
                    src={vid.smallThumbnail}
                    alt={vid.title}
                    className="w-16 h-10 rounded"
                    />
                    <div className="flex-1">
                    <p className="font-semibold">{vid.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <ArrowDropUpIcon
                        fontSize="large"
                        className={clsx(
                            "cursor-pointer",
                            userVoted[vid.id] === 1
                            ? "text-green-400"
                            : "text-green-600"
                        )}
                        onClick={() => handleVote(vid.id, "up")}
                        />
                        <span>{vid.upvotes || 0}</span>
                        <ArrowDropDownIcon
                        fontSize="large"
                        className={clsx(
                            "cursor-pointer",
                            userVoted[vid.id] === -1
                            ? "text-red-400"
                            : "text-red-600"
                        )}
                        onClick={() => handleVote(vid.id, "down")}
                        />
                        <span>{vid.downvotes}</span>
                    </div>
                    </div>
                    {i === 0 && (
                    <span className="px-2 py-1 text-sm bg-blue-600 rounded">
                        🎵 Now
                    </span>
                    )}
                </li>
                );
            })}
            </ul>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
            {currentVideo ? (
            <>
                <iframe
                key={currentVideo.id}
                src={`https://www.youtube.com/embed/${currentVideo.extractedId}?autoplay=1`}
                className="w-3/4 h-3/4 rounded-lg shadow-lg"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                ></iframe>
                <div className="flex space-x-4 mt-4">
                <Button variant="contained" onClick={playNext}>
                    Next ▶️
                </Button>
                <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    onClick={share}
                >
                    Share
                </Button>
                </div>
            </>
            ) : (
            <p className="text-gray-400">No video to play...</p>
            )}
        </div>
        </div>
    );
}
