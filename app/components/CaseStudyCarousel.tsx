"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselImage = { src: string; alt: string };

export default function CaseStudyCarousel({ images }: { images: CarouselImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const showControls = images.length > 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !showControls) return;

    // Slide aktif = slide dengan rasio interseksi terbesar di dalam track.
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          const index = slideRefs.current.findIndex((el) => el === entry.target);
          if (index === -1 || entry.intersectionRatio <= 0) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveIndex(best.index);
      },
      { root: track, threshold: [0.5, 0.75, 1] }
    );

    for (const el of slideRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [images.length, showControls]);

  const scrollToIndex = (index: number) => {
    const slide = slideRefs.current[index];
    trackRef.current?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: "smooth" });
  };

  const scrollByOneSlide = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByOneSlide(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByOneSlide(1);
    }
  };

  return (
    <div>
      <div className="relative" tabIndex={0} onKeyDown={handleKeyDown}>
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl bg-black [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <div
              key={image.src}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="flex aspect-16/10 w-full shrink-0 snap-start items-center justify-center"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={750}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>

        {showControls && (
          <>
            <button
              type="button"
              onClick={() => scrollByOneSlide(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-opacity hover:opacity-85"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByOneSlide(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition-opacity hover:opacity-85"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-text-primary" : "w-1.5 bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
