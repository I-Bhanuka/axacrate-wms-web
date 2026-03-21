import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { useState, useEffect, useRef } from "react";
import { api } from "../api/http";
import type { RfidScanResponse } from "../types";
import { Search, RefreshCcw, SearchCheck, SearchAlert } from 'lucide-react';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../lib/queryClient";
import { getErrorMessage } from "../lib/utils";
import { ItemCreateSuccess } from "../components/InventoryComponent/ItemCreateSuccess";
import { toast } from "sonner";


type ScanState = "idle" | "scanning" | "found" | "warning";

export function CreateItemPage() {
    const navigate = useNavigate();  // This hook is used to programmatically navigate the user to different routes within the application.
    const queryClient = useQueryClient(); // This is used to invalidate and refetch inventory data after creating a new item.

    const [scanState, setScanState] = useState<ScanState>("idle"); //This tracks the current state of  the RFID scanning process,(idle, scanning, found, warning)
    const [tagData, setTagData] = useState<RfidScanResponse | null>(null);  //This holds the data returned from the RFID scan, which includes details about the scanned tag and its status. 
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null); //This ref is used to store the interval ID for polling the RFID scanner 

    const stopPolling = () => { if (pollRef.current) clearInterval(pollRef.current); };
    useEffect(() => () => stopPolling(), []);

    const [form, setForm] = useState({ sku: "", name: "", quantity: "" }); //This state holds the form data for creating a new inventory item, including SKU, name, and quantity.
    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));   //This is a helper function to update the form state when the user types into the input fields. 

    const [errors, setErrors] = useState<Record<string, string>>({}); //This state is intended to hold any validation errors for the form fields, allowing the UI to display error messages next to the relevant inputs.

    const [created, setCreated] = useState(false);

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

    const validate = () => {
        const e: Record<string, string> = {};
        if (!tagData) e.tag = "Please scan a tag first";
        if (!form.sku.trim()) e.sku = "SKU is required";
        if (!form.name.trim()) e.name = "Name is required";
        if (form.quantity === "" || Number(form.quantity) < 0) e.quantity = "Valid quantity required";
        setErrors(e);
        return Object.keys(e).length === 0;
    }; // This function validates the form data before allowing the item to be created. It checks for the presence of a scanned tag.

    const createMutation = useMutation({
        mutationFn: () => api.createItem({
            sku: form.sku,
            name: form.name,
            quantity: Number(form.quantity),
            rfidTag: tagData!.tagUid,
            zoneName: tagData!.currentZone ?? "",
        }),
        onSuccess: () => {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 520;
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
            setCreated(true);
            toast.success("Item created successfully!"),{
                position: "top-center",
            };
        },
    }); // This sets up a mutation using React Query to handle the API call for creating a new inventory item. 

    const submit = () => {
        if (scanState === "warning") return;
        if (!validate()) return;
        createMutation.mutate();
    };

    // Success state return
    if (created) {
        return (
            <>
                <PageHeader title="Create Item" subtitle="Register a new inventory item with RFID tag">
                    <Button variant="outline" onClick={() => navigate("/inventory")}>← Back</Button>
                </PageHeader>

                <div className="max-w-xl">
                    <ItemCreateSuccess
                        onScanAnother={() => {
                            setCreated(false);
                            setScanState("idle");
                            setTagData(null);
                            setForm({ sku: "", name: "", quantity: "" });
                            setErrors({});
                        }}
                        onGoToInventory={() => navigate("/inventory")}
                    />
                </div>
            </>
        );
    }

    // Main return 
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
                                <div className="text-3xl mb-2 flex items-center justify-center"><SearchCheck /></div>
                                <div className="font-semibold text-green-400 mb-1">Tag Detected!</div>
                                <div className="font-mono text-sm bg-muted/50 rounded px-3 py-1 inline-block mt-1">{tagData?.tagUid}</div>
                            </>)}
                            {scanState === "warning" && (<>
                                <div className="text-3xl mb-2 flex items-center justify-center"><SearchAlert /></div>
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
                            {errors.tag && <p className="text-destructive text-xs mt-2">{errors.tag}</p>}
                        </Button>

                        {scanState === "found" && (
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-border font-bold text-sm">Item Details</div>
                                <div className="p-4 flex flex-col gap-4">
                                    {createMutation.isError && (
                                        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2 rounded-lg">
                                            {getErrorMessage(createMutation.error)}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5">
                                        <Label>RFID Tag UID</Label>
                                        <Input value={tagData?.tagUid ?? ""} disabled />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>SKU *</Label>
                                        <Input placeholder="e.g. ITEM-2024-001" value={form.sku} onChange={set("sku")} />
                                        {errors.sku && <p className="text-destructive text-xs">{errors.sku}</p>}

                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Item Name *</Label>
                                        <Input placeholder="e.g. Industrial Bearing 6205" value={form.name} onChange={set("name")} />
                                        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}

                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Quantity *</Label>
                                        <Input type="number" min="0" placeholder="0" value={form.quantity} onChange={set("quantity")} />
                                        {errors.quantity && <p className="text-destructive text-xs">{errors.quantity}</p>}

                                    </div>
                                    <div className="flex gap-2.5 flex-wrap">
                                        <Button variant="outline" onClick={() => navigate("/inventory")}>Cancel</Button>
                                        <Button className="flex-1 min-w-36" onClick={submit} disabled={createMutation.isPending}>
                                            {createMutation.isPending ? "Creating…" : "Create Item"}
                                        </Button>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}