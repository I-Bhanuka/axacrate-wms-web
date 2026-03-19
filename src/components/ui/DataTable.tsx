import { Skeleton } from "./skeleton";

interface DataTableProps<T> {
  columns: { key: string; label: string; width?: string }[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  emptyIcon: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

// Generic reusable table — pass columns definition and renderRow function.
//
// Usage:
// <DataTable
//   columns={[{ key: "sku", label: "SKU" }, { key: "name", label: "Name" }]}
//   data={items}
//   loading={isLoading}
//   keyExtractor={(item) => item.id}
//   renderRow={(item) => (
//     <tr key={item.id}>
//       <td>{item.sku}</td>
//       <td>{item.name}</td>
//     </tr>
//   )}
// />

export function DataTable<T>({
  columns,
  data,
  loading = false,
  skeletonRows = 8,
  emptyIcon = "📭",
  emptyTitle = "No data found",
  emptySubtitle = "Try adjusting your filters",
  renderRow,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className="w-full border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3 opacity-40">{emptyIcon}</div>
                  <div className="font-semibold text-foreground text-sm mb-1">{emptyTitle}</div>
                  <div className="text-xs">{emptySubtitle}</div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={keyExtractor(item)}
                className="border-b border-border hover:bg-muted/20 transition-colors"
              >
                {renderRow(item, i)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
