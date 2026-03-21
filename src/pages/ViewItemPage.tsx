// ─────────────────────────────────────────────────────────────────────────────
// VIEW ITEM PAGE — Assigned to: Member 2 - Sheshan
// 
// TODO: Implement the View Item page to display detailed information about a specific inventory item, including its current zone, movement history, and any associated alerts.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";  // Importing useNavigate to programmatically navigate and useParams to access URL parameters
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { Skeleton } from "../components/ui/skeleton";  // Importing a Skeleton component for loading state visualization


export function ViewItemPage() {
    const { id } = useParams<{ id: string }>(); // Get the item ID from the URL parameters
    const navigate = useNavigate();

    const { data: item, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.item(id!), // Assuming the API client has a method to fetch item details by ID
        queryFn: () => api.getItem(id!),          // Replace with actual API call to fetch item details
        enabled: !!id,                            // Only run the query if an ID is provided
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
        <div className="max-w-xl">
            <p className="text-muted-foreground p-4">Item loaded: {item.sku}</p>
        </div>
    );
}