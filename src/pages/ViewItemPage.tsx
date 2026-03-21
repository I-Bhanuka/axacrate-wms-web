// ─────────────────────────────────────────────────────────────────────────────
// VIEW ITEM PAGE — Assigned to: Member 2 - Sheshan
// 
// TODO: Implement the View Item page to display detailed information about a specific inventory item, including its current zone, movement history, and any associated alerts.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";  // Importing useNavigate to programmatically navigate and useParams to access URL parameters
<<<<<<< HEAD
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { Skeleton } from "../components/ui/skeleton";  // Importing a Skeleton component for loading state visualization
import { ConfirmModal } from "../components/ui/ConfirmModal"; // Importing a ConfirmModal component for confirming actions.
import { useState } from "react";
import { Button } from "../components/ui/button";
import { PageHeader } from "../components/ui/PageHeader"; // Importing a PageHeader component for consistent page headers across the app.
import { fmtDate, fmtNum } from "../lib/utils"; // Importing formatting utilities for dates and numbers.
import { ZoneBadge } from "../components/ui/ZoneBadge"; // Importing a ZoneBadge component to visually represent the item's current zone.
=======
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { Skeleton } from "../components/ui/skeleton";  // Importing a Skeleton component for loading state visualization
>>>>>>> 8781e9f (Add initial viewItemPage)


export function ViewItemPage() {
    const { id } = useParams<{ id: string }>(); // Get the item ID from the URL parameters
    const navigate = useNavigate();

<<<<<<< HEAD
    const queryClient = useQueryClient();
    const [confirmDel, setConfirmDel] = useState(false);

=======
>>>>>>> 8781e9f (Add initial viewItemPage)
    const { data: item, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.item(id!), // Assuming the API client has a method to fetch item details by ID
        queryFn: () => api.getItem(id!),          // Replace with actual API call to fetch item details
        enabled: !!id,                            // Only run the query if an ID is provided
    });

<<<<<<< HEAD
    const deleteMutation = useMutation({
        mutationFn: () => api.deleteItem(item!.sku),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
            navigate("/inventory");
        },
    });



=======
>>>>>>> 8781e9f (Add initial viewItemPage)
    // Handle loading state
    if (isLoading) return (
        <div className="max-w-xl">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
        </div>
    );

    // Handle case where item is not found
    if (!item) return <div className="text-muted-foreground p-4">Item not found</div>;

<<<<<<< HEAD
    const fields = [
        { label: "SKU", value: item.sku, mono: true },
        { label: "Name", value: item.name, mono: false },
        { label: "Quantity", value: fmtNum(item.quantity), mono: true },
        { label: "Zone", value: <ZoneBadge zone={item.currentZoneName} />, mono: false },
        { label: "Created", value: fmtDate(item.createdAt), mono: false },
        { label: "Updated", value: fmtDate(item.updatedAt), mono: false },
    ];

    return (
        <>
            {confirmDel && (
                <ConfirmModal
                    title="Delete Item"
                    body={`Delete "${item.sku}"? This cannot be undone.`}
                    onConfirm={() => deleteMutation.mutate()}
                    onCancel={() => setConfirmDel(false)}
                    loading={deleteMutation.isPending}
                />
            )}

            <PageHeader title={item.name} subtitle={item.sku}>
                <Button variant="outline" onClick={() => navigate("/inventory")}>← Back</Button>
                <Button variant="outline" onClick={() => navigate(`/inventory/${item.sku}/edit`)}>Edit</Button>
                <Button variant="destructive" onClick={() => setConfirmDel(true)}>Delete</Button>
            </PageHeader>

            {/*details card*/}
            <div className="max-w-xl">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border font-bold text-sm">Item Details</div>
                    <div className="p-4">

                        {/* COMMIT 3: fields grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {fields.map((f, i) => (
                                <div key={i}>
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{f.label}</div>
                                    <div className={`text-sm font-medium ${f.mono ? "font-mono" : ""}`}>{f.value}</div>
                                </div>
                            ))}
                        </div>

                        {/*RFID tag */}
                        <div>
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">RFID Tag UID</div>
                            <div className="font-mono text-sm bg-muted/40 px-3 py-2 rounded-lg break-all">{item.rfidTagUid}</div>
                        </div>

                    </div>
                </div>
            </div>
        </>
            );
=======
    return (
        <div className="max-w-xl">
            <p className="text-muted-foreground p-4">Item loaded: {item.sku}</p>
        </div>
    );
>>>>>>> 8781e9f (Add initial viewItemPage)
}