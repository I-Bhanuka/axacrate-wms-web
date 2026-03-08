import { useState, useEffect, useRef } from "react";
import { api } from "../api/http";
import { MoveRight, SearchAlert } from "lucide-react";
import type { MovementLog, FeedEntry } from "../types";

export function LiveFeed({ user } : { user: { username: string } | null }) {
    const [feed, setFeed] = useState<FeedEntry[]>([]);
    const [pulse, setPulse] = useState(false);
    const [lastScan, setLastScan] = useState("—");
    const [scanCount, setScanCount] = useState(0);
    const seenIds = useRef(new Set<string>());
    const seeded = useRef(false);


    {/* useEffect is a react hook that helps with the reloading of a component */}
    useEffect(() => {
        {/* If the user is not logged in, do nothing*/}
        if (!user) return;
        seenIds.current = new Set(); {/* Remembers the Movements shown*/}
        seeded.current  = false;  {/* Remembers if the feed was initially loaded */}

        {/* poll is an async function that fetches the recent movements from the API and updates the feed */}
        const poll = async () => {
        try {
            const movements: MovementLog[] = await api.getRecentMovements(20);
            if (!movements?.length) return;


            {/* This block runs only on the first load to seed the feed with the latest movements without marking them as new */}
            {/* Otherwise every item in the initial load would be marked as new, which is not desired */}
            if (!seeded.current) {
            {/* Add all seen movement IDs to the set to prevent them from being marked as new in subsequent polls */}
            movements.forEach(m => seenIds.current.add(m.id));

            {/* Get the first 10 movements and map them to the feed format, marking them as not new */}
            setFeed(movements.slice(0, 10).map(m => ({
                id: m.id,
                itemName: m.itemName ?? "Unknown",
                fromZone: m.fromZoneName,
                toZone:   m.toZoneName,
                time:     new Date(m.occurredAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                date:     new Date(m.occurredAt).toLocaleDateString("en-US"),
                isNew:    false, 
            })));
            seeded.current = true; {/* Mark the feed as seeded */}
            return;
            }

            let hasNew = false;
            movements.forEach(m => {
            if (!seenIds.current.has(m.id)) {
                seenIds.current.add(m.id);
                hasNew = true;

                {/* Create a new feed entry for the movement, marking it as new */}
                const entry: FeedEntry = {
                id: m.id,
                itemName: m.itemName ?? "Unknown",
                fromZone: m.fromZoneName,
                toZone:   m.toZoneName,
                time:     new Date(m.occurredAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                date:     new Date(m.occurredAt).toLocaleDateString("en-US"),
                isNew:    true,
                };

                {/* Add the new entry to the top of the feed and limit the feed to the 20 most recent entries */}
                setFeed(prev => [entry, ...prev].slice(0, 20));
                {/* Update the last scan time and increment the scan count for the session */}
                setLastScan(entry.time);
                setScanCount(c => c + 1);

                {/* After 2.5 seconds, mark the entry as not new to trigger the fade-out animation */}
                setTimeout(() => {
                setFeed(prev => prev.map(e => e.id === m.id ? { ...e, isNew: false } : e));
                }, 2500);
            }
            });

            {/* If there are new movements, trigger the pulse animation on the RFID reader indicator */}
            if (hasNew) { 
            setPulse(true); setTimeout(() => setPulse(false), 800); 
            }

            {/* If there's an error during the API call, we catch it and do nothing */}
        } catch { /* silent */ }
        };

        {/* Start polling immediately and then every 3 seconds to keep the feed updated in real-time */}
        poll();
        const t = setInterval(poll, 3000);
        return () => clearInterval(t);
        
    }, [user]);


        {/* Helper method: to format date and time from movement logs */}
    const isToday = (someDate: string | Date) => {
    const date = new Date(someDate); {/* Convert to Date object if it's a string */}
    const today = new Date(); {/* Get today's date */}

            {/* Date, Month, Year all has to return true */}
    return (
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <>
            {/* LIVE FEED */}
            {/* aside is used for side panels */}
            <aside className="w-[260px] flex-shrink-0 border-l bg-gray-1000 flex flex-col h-screen">

                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] animate-pulse" />
                    <span className="text-[12px] font-bold tracking-widest text-gray-400">
                    LIVE FEED
                    </span>
                </div>

                <span className="text-[12px] text-gray-400 font-mono">
                    {feed.length} events
                </span>

                </div>

                {/* Feed container */}
                <div className="flex-1 overflow-y-auto p-3">

                {feed.length === 0 ? (

                    <div className="py-10 text-center">
                    <div className="flex justify-center text-3xl mb-2 opacity-25"><SearchAlert size={48} /></div>
                    <div className="text-xs text-gray-600 font-mono font-bold tracking-widest">
                        WAITING FOR SCANS
                    </div>
                    </div>

                ) : (

                    feed.map(entry => (
                    <div
                        key={entry.id}
                        className={`p-3 mb-2 rounded-md transition-all duration-300
                        ${
                        entry.isNew
                            ? "bg-orange-500/10 border border-orange-500/30"
                            : "bg-white/[0.02] border border-white/[0.05]"
                        }`}
                    >

                        {/* Item name */}
                        <div
                        className={`text-base font-semibold font-mono mb-1 truncate
                        ${entry.isNew ? "text-orange-400" : "text-gray-300"}`}
                        >
                        {entry.itemName}
                        </div>

                        {/* Movement */}
                        <div className="flex items-center gap-1 text-xs">

                        <span className="text-[13px] text-gray-500 font-bold">
                            {entry.fromZone ?? "—"}
                        </span>

                        <span className="text-orange-500/80"><MoveRight size={17} strokeWidth={3} /></span>

                        <span className={entry.isNew ? "text-[13px] text-orange-400" : "text-gray-400 font-bold"}>
                            {entry.toZone}
                        </span>

                        </div>

                        {/* Date */}
                        <div className="text-[12px] text-gray-600 mt-1">
                        {isToday(entry.date) ? "Today" : entry.date}
                        </div>

                        {/* Time */}
                        <div className="text-[12px] text-gray-600 mt-1">
                        {entry.time}
                        </div>

                    </div>
                    ))

                )}

                </div>

                {/* Custom stayles for scrollbar and animations */}
                <style>{`
                @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
                @keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
                ::-webkit-scrollbar{width:3px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(255, 106, 0, 0.37);border-radius:2px}
            `}</style>

            </aside>
        </>

    )
}