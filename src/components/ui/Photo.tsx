import Image from "next/image";
import { cn } from "@/lib/cn";

type PhotoProps = {
  src: string;
  alt: string;
  /** Required: tells next/image which width to download at each breakpoint. */
  sizes: string;
  priority?: boolean;
  position?: string;
  className?: string;
};

export function Photo({
  src,
  alt,
  sizes,
  priority = false,
  position = "50% 50%",
  className,
}: PhotoProps) {
  return (
    <div className={cn("overflow-hidden", className ?? "absolute inset-0")}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}
