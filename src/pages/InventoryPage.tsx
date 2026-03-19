// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY PAGE — Assigned to: Member 2 - Sheshan
//
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { useDebounce } from "../hooks/useDebounce";
import { fmtNum, fmtDate, getErrorMessage } from "../lib/utils";
import { ZoneBadge } from "../components/ui/ZoneBadge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import type { InventoryItem } from "../types";

export function InventoryPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const [sort, setSort] = useState({ field: "sku", dir: "asc" });
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ zoneId: "", minQty: "", maxQty: "" });
    const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

    const dSearch = useDebounce(search, 300);

    const { data: zones = [] } = useQuery({
        queryKey: QUERY_KEYS.zones.all,
        queryFn: api.getZones,
    });

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.list({ page, sort, search: dSearch, filters }),
        queryFn: () => api.getItems({
            page, size: 20,
            sort: `${sort.field},${sort.dir}`,
            query: dSearch.length >= 3 ? dSearch : undefined,
            zoneId: filters.zoneId || undefined,
            minQuantity: filters.minQty || undefined,
            maxQuantity: filters.maxQty || undefined,
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: (sku: string) => api.deleteItem(sku),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
            setDeleteTarget(null);
        },
    });

    const items = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <>
            {/* Delete confirmation modal */}
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Item"
                    body={`Delete "${deleteTarget.sku} — ${deleteTarget.name}"? This cannot be undone.`}
                    onConfirm={() => deleteMutation.mutate(deleteTarget.sku)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteMutation.isPending}
                />
            )}

            <PageHeader title="Inventory" subtitle={`${fmtNum(totalElements)} total items`}>
                <Button onClick={() => navigate("/createItem")}>+ Create Item</Button>
            </PageHeader>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Filter bar, table, pagination go here in later commits */}
                
                {/* Filter bar */}
                <div className="p-4 border-b border-border flex flex-wrap gap-2.5 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
                        <Input
                            className="pl-8"
                            placeholder="Search SKU, name or RFID (min 3 chars)…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>
                    <select
                        className="h-9 px-3 text-sm bg-background border border-input rounded-md min-w-[130px]"
                        value={filters.zoneId}
                        onChange={e => { setFilters(f => ({ ...f, zoneId: e.target.value })); setPage(0); }}
                    >
                        <option value="">All Zones</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <Input type="number" placeholder="Min Qty" className="w-24"
                        value={filters.minQty} onChange={e => { setFilters(f => ({ ...f, minQty: e.target.value })); setPage(0); }} />
                    <Input type="number" placeholder="Max Qty" className="w-24"
                        value={filters.maxQty} onChange={e => { setFilters(f => ({ ...f, maxQty: e.target.value })); setPage(0); }} />
                    <Button variant="outline" size="sm"
                        onClick={() => { setFilters({ zoneId: "", minQty: "", maxQty: "" }); setSearch(""); setPage(0); }}>
                        Clear
                    </Button>
                </div>
            </div>
        </>
    );
}
