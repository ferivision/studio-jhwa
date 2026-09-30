"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { locales, swapLocale, type Locale } from "@/lib/i18n/locales";

type LangSwitchProps = { lang: Locale; labels: Record<Locale, string>; className?: string };

export function LangSwitch({ lang, labels, className }: LangSwitchProps) {
  const pathname = usePathname();
  const target = locales.find((l) => l !== lang) ?? lang;
  return (
    <Link
      href={swapLocale(pathname, target)}
      hrefLang={target}
      lang={target}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center uppercase no-underline",
        className,
      )}
    >
      {target}
      <span className="sr-only"> {labels[target]}</span>
    </Link>
  );
}
