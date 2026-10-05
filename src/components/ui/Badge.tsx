import React from 'react';

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'brand' | 'accent';

export const toneBadge: Record<Tone, string> = {
  ok: 'bg-ok-50 text-ok-700 ring-ok-100',
  warn: 'bg-warn-50 text-warn-700 ring-warn-100',
  danger: 'bg-danger-50 text-danger-700 ring-danger-100',
  info: 'bg-info-50 text-info-700 ring-info-100',
  neutral: 'bg-offline-50 text-offline-600 ring-offline-100',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-100'
};

export const toneDot: Record<Tone, string> = {
  ok: 'bg-ok-500',
  warn: 'bg-warn-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-offline-400',
  brand: 'bg-brand-600',
  accent: 'bg-accent-500'
};

export const toneText: Record<Tone, string> = {
  ok: 'text-ok-600',
  warn: 'text-warn-600',
  danger: 'text-danger-600',
  info: 'text-info-700',
  neutral: 'text-ink-muted',
  brand: 'text-brand-600',
  accent: 'text-accent-600'
};

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot = false, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneBadge[tone]} ${className}`}>
      
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} aria-hidden />}
      {children}
    </span>);

}