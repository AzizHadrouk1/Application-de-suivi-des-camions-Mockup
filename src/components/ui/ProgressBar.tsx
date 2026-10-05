import React from 'react';
import { toneDot, type Tone } from './Badge';

interface ProgressBarProps {
  value: number;
  tone?: Tone;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, tone = 'brand', className = '', label }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line ${className}`}>
      
      <div className={`h-full rounded-full ${toneDot[tone]}`} style={{ width: `${pct}%` }} />
    </div>);

}