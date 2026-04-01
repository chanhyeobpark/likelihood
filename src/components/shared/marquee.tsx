"use client";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Marquee({ children, speed = 30, className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-flex animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex items-center gap-8 pr-8">{children}</div>
        <div className="flex items-center gap-8 pr-8" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
