import React from "react";
import { twMerge } from "tailwind-merge";
import { BoxIcon } from "lucide-react";
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'icon' | 'icon-sm';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: BoxIcon;
}
const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-canvas',
  ghost: 'text-ink-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-white text-danger-600 ring-1 ring-inset ring-danger-100 hover:bg-danger-50',
  dark: 'bg-navy-900 text-white hover:bg-navy-800'
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  icon: 'h-9 w-9',
  'icon-sm': 'h-7 w-7'
};
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const small = size === 'sm' || size === 'icon-sm';
  return <button type={type} className={twMerge('inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)} {...rest}>
      {Icon && <Icon className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />}
      {children}
    </button>;
}