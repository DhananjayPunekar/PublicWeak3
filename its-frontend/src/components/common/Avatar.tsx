import { useState } from 'react';

/** Props of {@link Avatar}. */
interface AvatarProps {
  /** Person's name: used for the alt text and the initials fallback. */
  name: string;
  /** Profile image URL; initials are shown when missing or broken. */
  src?: string | null;
  /** Width and height in pixels. */
  size?: number;
  /** Extra classes (e.g. a border). */
  className?: string;
}

/** Background colours for the initials fallback. */
const COLORS = ['#0f766e', '#7c3aed', '#db2777', '#ea580c', '#2563eb', '#16a34a', '#9333ea', '#0891b2'];

/** First letter or digit of the first two words, e.g. "Jack Finn" -> "JF", "User #10" -> "U1". */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase())
    .filter((letter) => letter !== '')
    .slice(0, 2)
    .join('') || '?';
}

/** Picks a stable colour for a name, so a person always gets the same colour. */
function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return COLORS[hash % COLORS.length];
}

/** Round profile picture with an initials fallback. */
export function Avatar({ name, src, size = 32, className = '' }: AvatarProps) {
  /** URL that failed to load; remembered so we fall back to initials. */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  if (showImage && src) {
    return (
      <img src={src} alt={name} title={name} width={size} height={size}
        className={`rounded-circle object-fit-cover flex-shrink-0 ${className}`}
        onError={() => setFailedSrc(src)} />
    );
  }
  return (
    <span className={`avatar-initials rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: colorFor(name), fontSize: Math.max(10, size * 0.4) }}
      title={name} role="img" aria-label={name}>
      {initialsOf(name)}
    </span>
  );
}
