// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENTS PAGE — Assigned to: Member 6 - Ahintha
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { fmtDate, fmtTime } from "../lib/utils";
import { PageHeader } from "../components/ui/PageHeader";
import { ZoneBadge } from "../components/ui/ZoneBadge";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import type { MovementLog } from "../types";


const COLUMNS = [
  { key: "item",      label: "Item"       },
  { key: "sku",       label: "SKU"        },
  { key: "from",      label: "From"       },
  { key: "to",        label: "To"         },
  { key: "eventType", label: "Event"      },
  { key: "time",      label: "Time"       },
];
export default function MovementsPage() {
  const [limit, setLimit] = useState(50);


  const { data: movements = [], isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.movements.recent(limit),
    queryFn:  () => api.getMovements(limit),
  });


  return (
    <>
      <PageHeader title="Movement Log" subtitle={`${movements.length} movements`}>
        <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">Last 20</SelectItem>
            <SelectItem value="50">Last 50</SelectItem>
            <SelectItem value="100">Last 100</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => refetch()}>↻ Refresh</Button>
        {/* TODO M6: Add export CSV button here */}
      </PageHeader>


      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <DataTable<MovementLog>
          columns={COLUMNS}
          data={movements}
          loading={isLoading}
          keyExtractor={m => m.id}
          emptyIcon="📡"
          emptyTitle="No movements yet"
          emptySubtitle="Movements appear as items are scanned by RFID readers"
          renderRow={(m) => (
            <>
              <td className="px-4 py-3 font-semibold text-sm">{m.itemName ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{m.itemSku ?? "—"}</td>
              <td className="px-4 py-3">
                {m.fromZoneName
                  ? <ZoneBadge zone={m.fromZoneName} />
                  : <span className="text-muted-foreground text-xs">—</span>
                }
              </td>
              <td className="px-4 py-3"><ZoneBadge zone={m.toZoneName} /></td>
              <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {m.eventType ?? "MOVEMENT"}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">{fmtTime(m.occurredAt)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(m.occurredAt)}</div>
              </td>
            </>
          )}
        />
      </div>
    </>
  );
}
