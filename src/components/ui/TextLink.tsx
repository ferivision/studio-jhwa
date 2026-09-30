import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = { dark: "hover:text-oak", light: "hover:text-glow" } as const;

type TextLinkProps = {
  href: string;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
};

export function TextLink({ href, tone = "dark", className, children }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-body underline underline-offset-6 transition-colors",
        tones[tone],
        className,
      )}
    >
      {children}
    </Link>
  );
}
