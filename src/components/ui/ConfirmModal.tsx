import { Button } from "./button";

interface ConfirmModalProps {
  title:     string;
  body:      string;
  onConfirm: () => void;
  onCancel:  () => void;
  loading?:  boolean;
  className?: string;
}

export function ConfirmModal({ title, body, onConfirm, onCancel, loading, className }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[500] p-4">
      <div className={`bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-5 ${className || ''}`}>
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{body}</p>
        <div className="flex gap-2.5 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
