import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  headingLevel = "h2",
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  /** Use "h1" when the empty state is the whole page. */
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className="flex flex-col items-center rounded-[14px] border border-dashed border-border-strong bg-surface-2 px-6 py-16 text-center sm:py-20"
    >
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          tone === "danger"
            ? "bg-danger-soft text-danger"
            : "bg-subtle text-muted"
        }`}
      >
        {icon}
      </span>
      <Heading className="display mt-5 text-[22px] leading-tight">{title}</Heading>
      {description && (
        <p className="mt-2 max-w-sm text-[15px] text-body">{description}</p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
