'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getScoreTier } from '@/lib/constants';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  minScore?: number;
  size?: number;
}

export function ScoreGauge({
  score,
  minScore = 300,
  maxScore = 900,
  size = 260,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const tier = getScoreTier(score);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half-circle
  const normalizedScore = (score - minScore) / (maxScore - minScore);
  const strokeDashoffset = circumference * (1 - normalizedScore);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = Date.now();

    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    tick();
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 30}
        viewBox={`0 0 ${size} ${size / 2 + 30}`}
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF006E" />
            <stop offset="25%" stopColor="#FF8800" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="75%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Score arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#glowFilter)"
        />

        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="fill-tl-text text-5xl font-bold"
          style={{ fontSize: '48px', fontWeight: 700 }}
        >
          {animatedScore}
        </text>

        {/* Tier label */}
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          fill={tier.color}
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          {tier.label}
        </text>
      </svg>

      <div className="flex justify-between w-full max-w-[240px] text-xs text-tl-text-muted mt-1">
        <span>{minScore}</span>
        <span>{maxScore}</span>
      </div>
    </div>
  );
}
