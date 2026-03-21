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
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";


export function EditItemPage() {
    const { sku } = useParams<{ sku: string }>();
    const navigate = useNavigate();

    const { data: item, isLoading } = useQuery({
        queryKey: QUERY_KEYS.inventory.bySku(sku!),
        queryFn: () => api.getItemBySku(sku!),
        enabled: !!sku,
    });

    const [form, setForm] = useState({ name: "", quantity: "" }); // Local state for form inputs.

    useEffect(() => {
        if (item) setForm({ name: item.name, quantity: String(item.quantity) });
    }, [item]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (form.quantity === "" || Number(form.quantity) < 0) e.quantity = "Valid quantity required";
        setErrors(e);
        if (Object.keys(e).length) return;
    };

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
                {/* form */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>RFID Tag UID</Label>
                            <Input value={item.rfidTagUid ?? ""} disabled />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>SKU</Label>
                            <Input value={item.sku} disabled />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Quantity *</Label>
                            <Input type="number" min="0" value={form.quantity}
                                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                                {errors.quantity && <p className="text-destructive text-xs">{errors.quantity}</p>}
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                            <Button variant="outline" onClick={() => navigate("/inventory")}>Cancel</Button>
                            <Button className="flex-1 min-w-36" onClick={submit}>Save Changes</Button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
