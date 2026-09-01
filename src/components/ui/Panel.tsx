import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** A titled card/panel surface used throughout the management UI. */
export function Panel({ title, subtitle, actions, children, className = '', bodyClassName = '' }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel-header">
          <div className="flex flex-col">
            {title && <h2 className="font-display text-base font-semibold uppercase tracking-wide2 text-chalk-100">{title}</h2>}
            {subtitle && <p className="text-xs text-chalk-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
