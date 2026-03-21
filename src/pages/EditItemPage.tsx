// ─────────────────────────────────────────────────────────────────────────────
// EDIT ITEM PAGE — Assigned to: Member 2 - Sheshan
//
// TODO: Build the edit item form, pre-fill with existing data, and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";

export function EditItemPage() {
  const { sku }  = useParams<{ sku: string }>();
  const navigate = useNavigate();

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
