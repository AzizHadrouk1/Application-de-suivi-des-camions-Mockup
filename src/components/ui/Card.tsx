import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({ title, subtitle, action, children, className, bodyClassName }: CardProps) {
  return (
    <section className={twMerge('flex flex-col rounded-xl border border-line bg-white shadow-card', className)}>
      {title &&
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      }
      <div className={twMerge('flex-1 px-5 pb-5', !title && 'pt-5', bodyClassName)}>{children}</div>
    </section>);

}