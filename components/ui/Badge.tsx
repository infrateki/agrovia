import type { BadgeVariant } from '@/lib/types';
import styles from './Badge.module.css';

interface BadgeProps {
  text: string;
  variant: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ text, variant, size = 'sm' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[size]} ${styles[variant]}`}>
      {text}
    </span>
  );
}
