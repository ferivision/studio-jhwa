import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  plaster: "bg-plaster text-ink",
  stone: "bg-stone text-ink",
  charcoal: "theme-dark bg-charcoal text-plaster",
  deep: "theme-dark bg-deep text-plaster",
} as const;

type SectionProps = {
  tone?: keyof typeof tones;
  id?: string;
  "aria-label"?: string;
  bleed?: boolean;
  className?: string;
  children: ReactNode;
};

export function Section({
  tone = "plaster",
  id,
  bleed = false,
  className,
  children,
  ...aria
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={aria["aria-label"]}
      className={cn("relative", tones[tone], !bleed && "py-section", className)}
    >
      {children}
    </section>
  );
}
