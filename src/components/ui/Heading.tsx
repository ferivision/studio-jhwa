import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  "display-xl": "text-display-xl",
  "display-lg": "text-display-lg",
  h2: "text-h2",
  "h2-em": "text-h2-em",
  h3: "text-h3",
  service: "text-service",
} as const;

const variants = { thin: "font-light", boldItalic: "font-semibold italic", mixed: "" } as const;

type HeadingProps = {
  as?: "h1" | "h2" | "h3";
  size: keyof typeof sizes;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

export function Heading({
  as: Tag = "h2",
  size,
  variant = "mixed",
  className,
  children,
}: HeadingProps) {
  return (
    <Tag className={cn("m-0 text-balance", sizes[size], variants[variant], className)}>
      {children}
    </Tag>
  );
}

export function HeadingThin({ children }: { children: ReactNode }) {
  return <span className="font-light">{children}</span>;
}

export function HeadingEm({ children }: { children: ReactNode }) {
  return <span className="font-semibold italic">{children}</span>;
}
