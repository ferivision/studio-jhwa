import { cn } from "@/lib/cn";

/** Glowing 2px "cove light" line. Position it with className (e.g. "top-0"). */
export function CoveLight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 origin-center animate-cove bg-glow shadow-cove",
        className,
      )}
    />
  );
}
