// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENTS PAGE — Assigned to: Member 6 - Ahintha
import { useEffect, useState } from "react";
import { api } from "@/api/http";
import type { MovementLog } from "@/types";

export default function MovementsPage() {
  const [movements, setMovements] = useState<MovementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    loadMovements(limit);
  }, [limit]);

  const loadMovements = async (selectedLimit: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMovements(selectedLimit);
      setMovements(data);
    } catch (err) {
      console.error("Failed to load movement logs:", err);
      setError("Failed to load movement logs.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movement Logs</h1>
          <p className="text-sm text-gray-600">
            View recent RFID inventory movements across warehouse zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="limit" className="text-sm font-medium text-gray-700">
            Show
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading movement logs...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : movements.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No movement logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Item</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">From Zone</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">To Zone</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Event Type</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Hardware</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Synced</th>
                  <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Occurred At</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-3">{movement.itemName ?? "-"}</td>
                    <td className="border-b px-4 py-3">{movement.itemSku ?? "-"}</td>
                    <td className="border-b px-4 py-3">{movement.fromZoneName ?? "-"}</td>
                    <td className="border-b px-4 py-3">{movement.toZoneName ?? "-"}</td>
                    <td className="border-b px-4 py-3">{movement.eventType}</td>
                    <td className="border-b px-4 py-3">{movement.hardwareType ?? "-"}</td>
                    <td className="border-b px-4 py-3">
                      {movement.synced ? "Yes" : "No"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {formatDateTime(movement.occurredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
