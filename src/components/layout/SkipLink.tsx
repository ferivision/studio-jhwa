export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-glow px-4 py-3 text-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}
