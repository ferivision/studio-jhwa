import type { Metadata } from "next";
import NotFound from "@/app/[lang]/not-found";
import { jost } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = { title: "404 | studioJHWA", robots: { index: false } };

// Unmatched URLs such as /fr bypass [lang]/layout, so this page renders its own <html>.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
