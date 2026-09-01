import type { ReactNode } from 'react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
}

const TONE_STYLES: Record<AlertTone, { container: string; dot: string }> = {
  info: { container: 'border-chalk-700 bg-chalk-800/40', dot: 'bg-pitch-400' },
  success: { container: 'border-success-600/40 bg-success-600/10', dot: 'bg-success-500' },
  warning: { container: 'border-warning-500/40 bg-warning-500/10', dot: 'bg-warning-500' },
  error: { container: 'border-danger-600/40 bg-danger-600/10', dot: 'bg-danger-500' },
};

export function Alert({ tone = 'info', title, children }: AlertProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div className={`flex gap-3 rounded-md border px-3 py-2.5 ${styles.container}`}>
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
      <div className="flex flex-col gap-0.5">
        {title && <p className="text-sm font-semibold text-chalk-100">{title}</p>}
        <div className="text-sm text-chalk-300">{children}</div>
      </div>
    </div>
  );
}
