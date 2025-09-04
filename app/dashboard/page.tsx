"use client";
import dynamic from "next/dynamic";
import Chat from "./Chat";
const DashboardClient = dynamic(() => import("./DashboardClient"), {
    ssr: false,
});

export default function Page() {
    return(
        <div>
    <DashboardClient />
        </div>
);
}
