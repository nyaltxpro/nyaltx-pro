import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={`admin-panel-card ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div data-slot="card-header" className={`space-y-1.5 ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div data-slot="card-content" className={className} {...props} />;
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return <div data-slot="card-footer" className={`flex items-center ${className}`} {...props} />;
}
