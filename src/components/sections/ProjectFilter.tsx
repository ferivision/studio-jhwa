"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { format } from "@/lib/i18n/format";
import type { Category } from "@/lib/schemas/project";

type FilterValue = "all" | Category;
type ProjectFilterProps = {
  filters: { value: FilterValue; label: string }[];
  rows: { key: string; category: Category; node: ReactNode }[];
  labels: { group: string; resultCount: string; empty: string };
};

export function ProjectFilter({ filters, rows, labels }: ProjectFilterProps) {
  const [active, setActive] = useState<FilterValue>("all");
  const visible = active === "all" ? rows : rows.filter((row) => row.category === active);
  return (
    <>
      <div role="group" aria-label={labels.group} className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const pressed = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={pressed}
              onClick={() => setActive(filter.value)}
              className={cn(
                "min-h-11 rounded-full border border-ink px-5.5 text-base",
                pressed ? "bg-ink text-plaster" : "bg-transparent text-ink hover:bg-stone",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {format(labels.resultCount, { count: visible.length })}
      </p>
      <div className="mt-16 flex flex-col border-b border-line">
        {visible.length === 0 ? (
          <p className="py-12 text-body-lg text-muted">{labels.empty}</p>
        ) : (
          visible.map((row) => <div key={row.key}>{row.node}</div>)
        )}
      </div>
    </>
  );
}
