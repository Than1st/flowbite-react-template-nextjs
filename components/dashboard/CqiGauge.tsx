"use client";

import { useEffect, useState } from "react";
import { getGrade, getProgressColor, parseSummaryGradeLetter } from "@/lib/utils/cqi";

interface CqiGaugeProps {
  value: number;
  gradeLetter?: string;
  size?: number;
  fill?: boolean;
  className?: string;
}

const ANIMATION_MS = 1200;
const VIEW = 200;
const RADIUS = 72;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function CqiGauge({
  value,
  gradeLetter,
  size = 220,
  fill = false,
  className,
}: CqiGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const target = Math.min(100, Math.max(0, value));
  const grade =
    parseSummaryGradeLetter(gradeLetter) ?? getGrade(target).grade;

  useEffect(() => {
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / ANIMATION_MS);
      setDisplayValue(target * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplayValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const progress = CIRCUMFERENCE * (displayValue / 100);
  const color = getProgressColor(displayValue);

  const gradeSize = fill
    ? "text-[clamp(1.25rem,8cqh,2.5rem)]"
    : size <= 150
      ? "text-2xl"
      : size <= 190
        ? "text-3xl"
        : "text-4xl xl:text-5xl";
  const scoreSize = fill
    ? "text-[clamp(0.625rem,3.5cqh,0.875rem)]"
    : size <= 150
      ? "text-[10px]"
      : size <= 190
        ? "text-xs"
        : "text-sm xl:text-base";

  const dimensionStyle = fill
    ? undefined
    : { width: size, height: size, maxWidth: size, maxHeight: size };

  return (
    <div
      className={`cqi-gauge relative mx-auto shrink-0 ${fill ? "aspect-square h-full max-h-full w-full max-w-full [container-type:size]" : ""} ${className ?? ""}`}
      style={dimensionStyle}
    >
      <svg
        width={fill ? "100%" : size}
        height={fill ? "100%" : size}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="block h-full w-full overflow-hidden"
        style={fill ? undefined : { maxWidth: size, maxHeight: size }}
        aria-hidden
      >
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={STROKE}
        />
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
          transform={`rotate(-90 ${VIEW / 2} ${VIEW / 2})`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading font-bold text-gray-900 ${gradeSize}`}>
          {grade}
        </span>
        <span className={`font-paragraph font-semibold text-secondary-700 ${scoreSize}`}>
          {Math.round(displayValue)}/100
        </span>
      </div>
    </div>
  );
}
