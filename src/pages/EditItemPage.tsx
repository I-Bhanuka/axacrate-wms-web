// ─────────────────────────────────────────────────────────────────────────────
// EDIT ITEM PAGE — Assigned to: Member 2 - Sheshan
//
// TODO: Build the edit item form, pre-fill with existing data, and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { Skeleton } from "../components/ui/skeleton";

export function EditItemPage() {
    const { sku } = useParams<{ sku: string }>();
    const navigate = useNavigate();

    const { data: item, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.bySku(sku!),
        queryFn: () => api.getItemBySku(sku!),
        enabled: !!sku,
    });

    if (isLoading) return (
        <div className="max-w-xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
        </div>
    );
    if (!item) return <div className="text-muted-foreground p-4">Item not found</div>;



    return (
        <>
            <PageHeader title="Edit Item" subtitle={sku}>
                <Button variant="outline" onClick={() => navigate("/inventory")}>← Back</Button>
            </PageHeader>

            <div className="max-w-xl">
                {/* form will go here */}
            </div>
        </>
    );
}
