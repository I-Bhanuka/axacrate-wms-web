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
import { fmtNum, fmtDate } from "../lib/utils";
import { ZoneBadge } from "../components/ui/ZoneBadge";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import type { InventoryItem } from "../types";
import { Search, Mailbox } from 'lucide-react';

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

    const handleSort = (field: string) => {
        setSort(s => s.field === field
            ? { field, dir: s.dir === "asc" ? "desc" : "asc" }
            : { field, dir: "asc" }
        );
        setPage(0);
    };

    const items = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    const pageNumbers = useMemo(() => {
        const arr = [];
        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    const sortIcon = (f: string) => sort.field === f ? (sort.dir === "asc" ? " ↑" : " ↓") : " ↕";

    const COLS = ["SKU", "Name", "Qty", "Zone", "RFID", "Created", "Actions"];
    const SORT_COLS: Record<string, string> = { SKU: "sku", Name: "name", Qty: "quantity", Created: "createdAt" };



    return (
        <>
            {/* Delete confirmation modal */}
            {deleteTarget && (
                <ConfirmModal
                    className="bg-neutral-900 border border-border"
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"><Search className="w-4 h-4" /></span>
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                {COLS.map(h => (
                                    <th key={h}
                                        className={`text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap ${SORT_COLS[h] ? "cursor-pointer hover:text-foreground select-none" : ""}`}
<<<<<<< HEAD
                                        onClick={() => SORT_COLS[h] && handleSort(SORT_COLS[h])}
                                    // Only attach click handler to sortable columns, and change cursor to indicate interactivity
=======
                                        onClick={() => SORT_COLS[h] && handleSort(SORT_COLS[h])}  
                                        // Only attach click handler to sortable columns, and change cursor to indicate interactivity
>>>>>>> cad9571 (Add necessary comments for the important lines)
                                    >
                                        {h}{SORT_COLS[h] && <span className="opacity-50">{sortIcon(SORT_COLS[h])}</span>} 
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        {COLS.map(c => <td key={c} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>)} 
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr><td colSpan={COLS.length}>
                                    <div className="flex flex-col items-center py-14 text-muted-foreground gap-1">
                                        <span className="text-4xl opacity-30"><Mailbox className="w-10 h-10" /></span>
                                        <span className="font-semibold text-foreground text-sm mt-2">No items found</span>
                                        <span className="text-xs">Try adjusting your search or filters</span>
                                    </div>
                                </td></tr>
                            ) : items.map(item => (
                                <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{item.sku}</td>
                                    <td className="px-4 py-3 font-medium text-sm">{item.name}</td>
                                    <td className="px-4 py-3 font-mono text-sm">
                                        <span className={item.quantity < 10 ? "text-red-400 font-bold" : ""}>
                                            {fmtNum(item.quantity)}{item.quantity < 10 && " ⚠"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><ZoneBadge zone={item.currentZoneName} /></td>
                                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{item.rfidTagUid?.slice(0, 10)}…</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(item.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/inventory/${item.id}`)}>View</Button>
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/inventory/edit/${item.sku}`)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(item)}>Del</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm flex-wrap gap-2">
                        <span className="text-muted-foreground text-xs">Showing {items.length} of {fmtNum(totalElements)}</span>
                        <div className="flex gap-1">
                            {[{ l: "«", a: () => setPage(0) }, { l: "‹", a: () => setPage(p => p - 1) }].map(b => (
                                <Button key={b.l} size="sm" variant="outline" disabled={page === 0} onClick={b.a}>{b.l}</Button>
                            ))}
                            {pageNumbers.map(p => (
                                <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => setPage(p)}>{p + 1}</Button>
                            ))}
                            {[{ l: "›", a: () => setPage(p => p + 1) }, { l: "»", a: () => setPage(totalPages - 1) }].map(b => (
                                <Button key={b.l} size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={b.a}>{b.l}</Button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
