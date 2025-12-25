"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1500,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTimeRef.current) / duration,
        1
      );

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(easeOutQuart * value);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
