"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Button from "@mui/material/Button";
import { ChevronUp, ChevronDown } from "lucide-react";
import ShareIcon from "@mui/icons-material/Share";
import clsx from "clsx";

interface Video {
  id: string;
  title: string;
  upvotes: number;
  downvotes: number;
  smallThumbnail: string;
  extractedId: string;
  url: string;
  bigThumbnail: string;
  haveVoted: boolean;
}

export default function DashboardClient() {
  const [url, setUrl] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const playerRef = useRef<any>(null);
  const lastVideoIdRef = useRef<string | null>(null);
  const { data: session } = useSession();

  const refreshQueue = useCallback(async () => {
    const res = await fetch("/api/streams/my");
    if (!res.ok) return;
    const { streams } = await res.json();

    const sorted = [...streams].sort(
      (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
    );
    setQueue(sorted);
    setCurrentVideo((cv) => {
      if (!cv) return sorted[0] ?? null;
      const stillInQueue = sorted.find((v) => v.id === cv.id);
      return stillInQueue ?? sorted[0];
    });
  }, []);

  useEffect(() => {
    refreshQueue();
    const iv = setInterval(refreshQueue, 10000);
    return () => clearInterval(iv);
  }, [refreshQueue]);

  const deleteCurrentVideo = async (videoId: string) => {
    try {
      await fetch("/api/streams", {
        method: "DELETE",
        body: JSON.stringify({ id: videoId }),
      });
      setQueue((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  const playNextVideoByVotes = async () => {
    if (!currentVideo) return;
    await deleteCurrentVideo(currentVideo.id);

    const sorted = [...queue]
      .filter((v) => v.id !== currentVideo.id)
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    setQueue(sorted);
    setCurrentVideo(sorted[0] ?? null);
  };

  const handleVote = async (id: string,haveVoted: boolean) => {
      setQueue((q) =>
      [...q]
        .map((v) => {
          if (v.id === id) {
            return {
              ...v,
              upvotes:haveVoted? v.upvotes + 1: v.upvotes,
              downvotes: haveVoted? v.downvotes + 1: v.downvotes,
            };
          }
          return v;
        })
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    );
    await fetch(`/api/streams/${haveVoted ? "downvotes": "upvotes"}`, {
      method: "POST",
      body: JSON.stringify({ streamId: id }),
    });
  };
  const handleSubmit = async () => {
    if (!url.startsWith("https")) return;
    await fetch(`/api/streams`, {
      method: "POST",
      body: JSON.stringify({
        creatorId: session?.user?.id ?? "",
        url,
      }),
    });
    setUrl("");
    refreshQueue();
  };

  const share = () => {
    if (!currentVideo) return;
    const link = new URL(window.location.href);
    link.searchParams.set("play", currentVideo.id);
    navigator.clipboard.writeText(link.toString());
    alert("Share link copied!");
  };

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (!currentVideo || !window.YT || !window.YT.Player) return;
    const currentId = currentVideo.extractedId;

    if (lastVideoIdRef.current === currentId) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn("YT Player destroy failed:", err);
      }
      playerRef.current = null;
    }

    playerRef.current = new window.YT.Player("yt-player", {
      videoId: currentId,
      events: {
        onReady: (event: any) => {
          event.target.playVideo();
        },
        onStateChange: async (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            await playNextVideoByVotes();
          }
        },
      },
    });

    lastVideoIdRef.current = currentId;
  }, [currentVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.warn("YT Player cleanup failed:", err);
        }
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="w-1/3 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Play Music</h2>

        <div className="mb-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
          {queue.map((vid, i) => (
            
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
                className="w-40 h-30 rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{vid.title}</p>
                <div className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded cursor-pointer">
                  {<ChevronUp/>}
                </div>
              </div>
              {i === 0 && (
                <span className="px-2 py-1 text-sm bg-blue-600 rounded">
                  🎵 Now
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center border-radius-lg border-3 border-gray-600 bg-blue-700 rounded-lg">
        <div id="yt-player" className="rounded-lg shadow-lg bg-white w-100 " />
        </div>
        <div className="bg-gray-800 p-2 rounded-lg  text-center flex flex-row items-center justify-center">
        {currentVideo ? (
          <div className="flex space-x-4 mt-4 gap-20">
            <Button variant="contained" onClick={playNextVideoByVotes}>
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
        ) : (
          <p className="text-gray-400 mt-4">No video to play...</p>
        )}
        </div>
      </div>
    </div>
  );
}
