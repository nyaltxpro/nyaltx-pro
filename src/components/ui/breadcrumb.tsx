import type { HTMLAttributes } from 'react';

export function Breadcrumb(props: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Breadcrumb" {...props} />;
}

export function BreadcrumbList(props: HTMLAttributes<HTMLOListElement>) {
  return <ol className="flex min-w-0 items-center" {...props} />;
}

export function BreadcrumbItem(props: HTMLAttributes<HTMLLIElement>) {
  return <li className="flex min-w-0 items-center" {...props} />;
}

export function BreadcrumbLink({
  className = '',
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbPage({
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={`inline-flex min-h-9 max-w-[220px] items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-100 ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span role="separator" aria-hidden="true" className={className} {...props} />
  );
}
