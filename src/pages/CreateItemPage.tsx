import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { useState, useEffect, useRef } from "react";
import { api } from "../api/http";
import type { RfidScanResponse } from "../types";
import { Search, RefreshCcw, SearchCheck, SearchAlert } from 'lucide-react';

type ScanState = "idle" | "scanning" | "found" | "warning";

export function CreateItemPage() {
    const navigate = useNavigate();

    const [scanState, setScanState] = useState<ScanState>("idle"); //This tracks the current state of  the RFID scanning process,(idle, scanning, found, warning)
    const [tagData, setTagData] = useState<RfidScanResponse | null>(null);  //This holds the data returned from the RFID scan, which includes details about the scanned tag and its status. 
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null); //This ref is used to store the interval ID for polling the RFID scanner 

    const stopPolling = () => { if (pollRef.current) clearInterval(pollRef.current); };
    useEffect(() => () => stopPolling(), []);

    const startScan = () => {
        setScanState("scanning");
        setTagData(null);
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const d = await api.pollRfid();
                if (!d) return;
                stopPolling();
                setTagData(d);
                setScanState(d.status === "ASSIGNED" ? "warning" : "found");
                // If the tag is already assigned to an item, we show a warning state. Otherwise, we show the found state and proceed with item creation.
            } catch { /* keep polling silently */ }
        }, 1500);
    };

    return (
        <>
            <PageHeader title="Create Item" subtitle="Register a new inventory item with RFID tag">
                <Button variant="outline" onClick={() => navigate("/inventory")}>← Back</Button>
            </PageHeader>

            <div className="max-w-xl">
                {/* panels will go here */}
                <div className="bg-card border border-border rounded-xl overflow-hidden mb-3.5">
                    <div className="px-4 py-3 border-b border-border font-bold text-sm">RFID Tag Scan</div>
                    <div className="p-4">
                        <div className={`rounded-xl p-6 text-center mb-4 transition-colors ${scanState === "scanning" ? "bg-blue-500/8 border border-blue-500/20" :
                            "bg-muted/30 border border-border"
                            }`}>
                            {scanState === "idle" && (<>
                                <div className="text-3xl mb-2 flex items-center justify-center text-3xl mb-2"><Search /></div>
                                <div className="font-semibold mb-1">Ready to Scan</div>
                                <div className="text-sm text-muted-foreground">Place RFID tag on the WRITER reader, then click Scan Tag</div>
                            </>)}
                            {scanState === "scanning" && (<>
                                <div className="text-3xl mb-2 text-3xl mb-2 flex items-center justify-center"><RefreshCcw /></div>
                                <div className="font-semibold mb-1">Waiting for ESP32…</div>
                                <div className="text-sm text-muted-foreground">Place the tag on the WRITER reader now</div>
                                <div className="mt-3 flex justify-center">
                                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            </>)}
                            {scanState === "found" && (<>
                                <div className="text-3xl mb-2"><SearchCheck /></div>
                                <div className="font-semibold text-green-400 mb-1">Tag Detected!</div>
                                <div className="font-mono text-sm bg-muted/50 rounded px-3 py-1 inline-block mt-1">{tagData?.tagUid}</div>
                            </>)}
                            {scanState === "warning" && (<>
                                <div className="text-3xl mb-2"><SearchAlert /></div>
                                <div className="font-semibold text-yellow-400 mb-1">Tag Already Assigned</div>
                                <div className="text-sm mb-3">Linked to: <strong>{tagData?.itemName}</strong> ({tagData?.sku})</div>
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" variant="outline" onClick={() => navigate(`/inventory/${tagData?.inventoryItemId}`)}>View Item</Button>
                                    <Button size="sm" variant="outline" onClick={() => setScanState("idle")}>Scan Different</Button>
                                </div>
                            </>)}
                        </div>

                        <Button className="w-full" onClick={startScan} disabled={scanState === "scanning"}>
                            {scanState === "scanning" ? "Waiting for scan…" : <> <Search /> Scan Tag</>}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}