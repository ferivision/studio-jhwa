import Link from "next/link";
import { cn } from "@/lib/cn";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

type HeaderProps = { lang: Locale; dict: Dictionary; variant: "overlay" | "solid" };

export function Header({ lang, dict, variant }: HeaderProps) {
  const home = localizedPath(lang);
  const links = [
    { href: localizedPath(lang, "/projects"), label: dict.nav.projects },
    { href: `${home}#services`, label: dict.nav.services },
    { href: `${home}#rooms`, label: dict.nav.rooms },
    { href: `${home}#faq`, label: dict.nav.faq },
  ];
  const cta = { href: "#contact", label: dict.nav.cta };

  return (
    <header
      className={cn(
        "theme-dark z-20 text-plaster",
        variant === "overlay" ? "absolute inset-x-0 top-0" : "relative bg-charcoal",
      )}
    >
      <div className="mx-auto flex h-header-sm max-w-site items-center justify-between px-gutter md:h-header">
        <Logo lang={lang} />
        <nav
          aria-label={dict.a11y.mainNav}
          className="hidden items-center gap-10 text-base lg:flex"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-glow">
              {link.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            className="inline-flex min-h-11 items-center rounded-full border border-plaster/45 px-5.5 no-underline hover:border-plaster"
          >
            {cta.label}
          </Link>
          <LangSwitch lang={lang} labels={dict.lang} />
        </nav>
        <MobileMenu
          links={links}
          cta={cta}
          labels={{ open: dict.a11y.openMenu, close: dict.a11y.closeMenu, menu: dict.a11y.menu }}
        >
          <LangSwitch lang={lang} labels={dict.lang} className="self-start" />
        </MobileMenu>
      </div>
    </header>
  );
}
