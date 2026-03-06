import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // action buttons go here
  className?: string;
}

// Usage:
// <PageHeader title="Inventory" subtitle="142 total items">
//   <Button onClick={() => navigate("/inventory/create")}>+ Create Item</Button>
// </PageHeader>

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-5 flex-wrap", className)}>
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
