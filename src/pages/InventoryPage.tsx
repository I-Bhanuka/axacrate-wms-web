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

    return <></>;
}
