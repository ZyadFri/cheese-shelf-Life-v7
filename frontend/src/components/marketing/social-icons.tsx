/**
 * Minimal monochrome brand marks for the footer's social row. Lucide
 * deliberately ships no brand/logo icons (trademarked shapes, not generic
 * line icons), so these small inline SVGs fill that one gap -- single
 * `currentColor` path each, sized like the rest of the app's 14-17px icon
 * language, no color/gradient branding applied.
 */

type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.5 8.5H16V6.1c-.6-.1-1.4-.1-2.2-.1-2.2 0-3.7 1.4-3.7 3.9v2H7.8v2.7h2.3V21h2.8v-6.4h2.3l.4-2.7h-2.7v-1.7c0-.8.2-1.4 1.6-1.4Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.9" cy="7.1" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.9 8.6H4V20h2.9V8.6ZM5.45 4c-1 0-1.65.66-1.65 1.53 0 .85.63 1.53 1.6 1.53h.02c1.02 0 1.65-.68 1.65-1.53C6.85 4.66 6.24 4 5.45 4ZM20 20h-2.9v-6.1c0-1.4-.5-2.35-1.75-2.35-.96 0-1.53.65-1.78 1.27-.09.22-.11.53-.11.84V20h-2.9s.04-9.9 0-11.4h2.9v1.62c.38-.6 1.08-1.44 2.62-1.44 1.9 0 3.32 1.24 3.32 3.92V20Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.6 10.6 20 3.5h-2l-5.4 5.9-4.5-5.9H3l6.7 8.8-6.9 7.7h2l5.8-6.4 4.8 6.4H21l-7.4-9.4Zm-2 2.3-.7-.9-5.4-7h2.2l4.3 5.7.7.9 5.6 7.4h-2.2l-4.5-6.1Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 8.2a2.7 2.7 0 0 0-1.9-1.9C18 5.8 12 5.8 12 5.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 9.9 2 12 2 12s0 2.1.4 3.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-3.8.4-3.8s0-2.1-.4-3.8ZM10 14.7V9.3l5 2.7-5 2.7Z" />
    </svg>
  );
}
