import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  selected?: boolean;
  onClick?: () => void;
}

export function RoleCard({ role, label, description, icon: Icon, color, selected, onClick }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 bg-card p-6 text-left transition-all hover:shadow-lg",
        selected ? "border-primary shadow-lg" : "border-border hover:border-primary"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-opacity",
          color,
          selected ? "opacity-10" : "opacity-0 group-hover:opacity-10"
        )}
      />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
