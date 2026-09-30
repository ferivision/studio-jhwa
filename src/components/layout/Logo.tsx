import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

export function Logo({ lang }: { lang: Locale }) {
  return (
    <Link href={localizedPath(lang)} className="flex min-h-11 items-center gap-3.5 no-underline">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="19.5" className="fill-night stroke-plaster/35" />
        <path d="M12 10h4v9h2v11h-4v-9h-2z" className="fill-plaster" />
        <path d="M21 10h4v9h2v11h-4v-9h-2z" className="fill-plaster" />
      </svg>
      <span className="text-wordmark tracking-[0.02em]">
        <span className="font-light">studio</span>
        <span className="font-medium">JHWA</span>
      </span>
    </Link>
  );
}
