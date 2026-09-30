import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type RoomsProps = { lang: Locale; dict: Dictionary["rooms"]; rooms: Home["rooms"] };

export function Rooms({ lang, dict, rooms }: RoomsProps) {
  return (
    <section
      id="rooms"
      aria-label={dict.label}
      className="theme-dark grid grid-cols-2 gap-0.5 bg-deep lg:grid-cols-4"
    >
      {rooms.map((room) => (
        <Link
          key={room.key}
          href={localizedPath(lang, "/projects")}
          className="group relative block h-[340px] overflow-hidden text-plaster no-underline sm:h-[480px] lg:h-[760px]"
        >
          <Photo
            src={room.src}
            alt={pick(room.alt, lang)}
            position={room.position}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-deep/0 to-deep/80"
          />
          <span className="absolute bottom-5 left-5 text-room font-semibold italic md:bottom-8 md:left-8">
            {dict[room.key]}
          </span>
        </Link>
      ))}
    </section>
  );
}
