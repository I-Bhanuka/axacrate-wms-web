// ─────────────────────────────────────────────────────────────────────────────
// VIEW ITEM PAGE — Assigned to: Member 2 - Sheshan
// 
// TODO: Implement the View Item page to display detailed information about a specific inventory item, including its current zone, movement history, and any associated alerts.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";  // Importing useNavigate to programmatically navigate and useParams to access URL parameters
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { Skeleton } from "../components/ui/skeleton";  // Importing a Skeleton component for loading state visualization
import { ConfirmModal } from "../components/ui/ConfirmModal"; // Importing a ConfirmModal component for confirming actions.
import { useState } from "react";
import { Button } from "../components/ui/button";
import { PageHeader } from "../components/ui/PageHeader"; // Importing a PageHeader component for consistent page headers across the app.


export function ViewItemPage() {
    const { id } = useParams<{ id: string }>(); // Get the item ID from the URL parameters
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [confirmDel, setConfirmDel] = useState(false);

    const { data: item, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.item(id!), // Assuming the API client has a method to fetch item details by ID
        queryFn: () => api.getItem(id!),          // Replace with actual API call to fetch item details
        enabled: !!id,                            // Only run the query if an ID is provided
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.deleteItem(item!.sku),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
            navigate("/inventory");
        },
    });



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
        </>
    );
}