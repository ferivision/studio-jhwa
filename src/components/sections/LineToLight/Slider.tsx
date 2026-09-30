"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";

type Img = { src: string; alt: string };
type SliderProps = {
  drawing: Img;
  render: Img;
  labels: { label: string; render: string; drawing: string };
  children: ReactNode;
};

export function Slider({ drawing, render, labels, children }: SliderProps) {
  const [position, setPosition] = useState(50);
  const inputId = useId();
  return (
    <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,480px)_minmax(0,640px)] xl:justify-between">
      <div className="flex flex-col gap-8">
        {children}
        <div className="mt-4 flex flex-col gap-3">
          <label htmlFor={inputId} className="text-small text-mist">
            {labels.label}
          </label>
          <input
            id={inputId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${position}% ${labels.render}`}
            className="h-11 w-full accent-glow"
          />
        </div>
      </div>
      <div className="relative aspect-[640/740] w-full max-w-[640px] overflow-hidden bg-paper">
        <Image
          src={drawing.src}
          alt={drawing.alt}
          fill
          sizes="(min-width: 1280px) 640px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image
            src={render.src}
            alt={render.alt}
            fill
            sizes="(min-width: 1280px) 640px, 100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 -ml-px w-0.5 bg-glow shadow-cove-sm"
          style={{ left: `${position}%` }}
        />
        <span className="absolute bottom-4.5 left-5 bg-deep/60 px-2.5 py-1 text-caption text-plaster">
          {labels.render}
        </span>
        <span className="absolute right-5 bottom-4.5 bg-paper/85 px-2.5 py-1 text-caption text-drawing">
          {labels.drawing}
        </span>
      </div>
    </div>
  );
}
