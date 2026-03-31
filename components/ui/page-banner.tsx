import { cn } from "@/lib/utils";

export function PageBanner({
  category,
  title,
  description,
  actions,
  className,
}: {
  category?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        {category && (
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {category}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 mt-1">{actions}</div>
      )}
    </div>
  );
}
