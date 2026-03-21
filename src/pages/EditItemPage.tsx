// ─────────────────────────────────────────────────────────────────────────────
// EDIT ITEM PAGE — Assigned to: Member 2 - Sheshan
//
// TODO: Build the edit item form, pre-fill with existing data, and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function EditItemPage() {
    const { sku } = useParams<{ sku: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: "", quantity: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = () => { };

    return <div />;
}
