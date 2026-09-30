import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";

const variants = {
  glow: "min-h-13 px-7 bg-glow text-charcoal text-body font-medium hover:bg-plaster",
  outline: "min-h-11 px-5.5 border border-current/45 text-base hover:border-current",
} as const;

type ButtonProps = {
  href: string;
  variant: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

export function Button({ href, variant, className, children }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full no-underline transition-colors",
    variants[variant],
    className,
  );
  if (/^https?:\/\//.test(href)) {
    return (
      <ExternalLink href={href} className={classes}>
        {children}
      </ExternalLink>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
