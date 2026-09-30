"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type NavLink = { href: string; label: string };
type MobileMenuProps = {
  links: NavLink[];
  cta: NavLink;
  labels: { open: string; close: string; menu: string };
  children?: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ links, cta, labels, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);

  useEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!open || !panel) return;
    restoreFocus.current = true;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (restoreFocus.current) toggle?.focus();
    };
  }, [open]);

  // Following a link: close without pulling focus (and scroll) back to the header.
  const closeForNavigation = () => {
    restoreFocus.current = false;
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center"
      >
        <span className="sr-only">{labels.open}</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="stroke-current"
        >
          <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        hidden={!open}
        className="theme-dark fixed inset-0 z-50 flex flex-col gap-10 overflow-y-auto bg-charcoal px-gutter py-6 text-plaster"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
          >
            <span className="sr-only">{labels.close}</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="stroke-current"
            >
              <path d="M5 5l14 14M19 5L5 19" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <nav aria-label={labels.menu}>
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeForNavigation}
                  className="block py-2 text-h2 font-light no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href={cta.href}
          onClick={closeForNavigation}
          className="inline-flex min-h-13 items-center self-start rounded-full bg-glow px-7 text-body font-medium text-charcoal no-underline"
        >
          {cta.label}
        </Link>
        {children}
      </div>
    </div>
  );
}
