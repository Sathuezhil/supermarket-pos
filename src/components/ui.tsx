import { formatLKR } from '../types';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'slate';
}

const colorMap = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  orange: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-800',
  slate: 'border-slate-200 bg-white text-slate-800',
};

export function StatCard({ title, value, subtitle, icon, color = 'slate' }: StatCardProps) {
  return (
    <div className={`card border p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs opacity-70">{subtitle}</p>}
        </div>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative flex max-h-[92dvh] w-full flex-col ${sizeClass[size]} card rounded-b-none shadow-xl sm:max-h-[90dvh] sm:rounded-xl sm:p-6`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:border-0 sm:px-0 sm:pb-0 sm:pt-0">
          <h2 className="pr-4 text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-0 sm:py-0 sm:pt-4">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      {icon && <div className="mb-3 opacity-50">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}

type TableAlign = 'left' | 'center' | 'right';

const alignClass: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function DataTable({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="table-wrap">
      {title && (
        <div className="table-wrap-title">
          <h3>{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="pos-table">{children}</table>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableFoot({ children }: { children: React.ReactNode }) {
  return <tfoot>{children}</tfoot>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

export function TableTh({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: TableAlign;
}) {
  return <th className={alignClass[align]}>{children}</th>;
}

export function TableTd({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: TableAlign;
  className?: string;
}) {
  return <td className={`${alignClass[align]} ${className}`.trim()}>{children}</td>;
}

export { formatLKR };
