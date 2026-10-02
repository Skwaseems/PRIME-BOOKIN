import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center"
    >
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          tone === "danger"
            ? "bg-danger-soft text-danger"
            : "bg-subtle text-muted"
        }`}
      >
        {icon}
      </span>
      <h2 className="mt-4 font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
