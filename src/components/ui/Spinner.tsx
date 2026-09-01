import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 18, className = '' }: SpinnerProps) {
  return <Loader2 size={size} className={`animate-spin text-pitch-400 ${className}`} />;
}

interface FullPageSpinnerProps {
  label?: string;
}

export function FullPageSpinner({ label = 'Carregando…' }: FullPageSpinnerProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-chalk-950">
      <Spinner size={28} />
      <p className="text-sm text-chalk-400">{label}</p>
    </div>
  );
}
