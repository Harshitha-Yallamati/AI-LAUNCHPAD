import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle, Copy, Check, Loader2 } from 'lucide-react';

// ─── Modal ──────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${maxWidth}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {subtitle && <p className="text-[10px] font-mono text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 text-center">
          <div
            className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              variant === 'danger' ? 'bg-status-danger/10' : 'bg-status-warning/10'
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${variant === 'danger' ? 'text-status-danger' : 'text-status-warning'}`}
            />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
          <p className="text-xs text-text-secondary mb-4">{message}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={onClose} className="btn-secondary text-xs px-4 py-1.5">
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`text-xs px-4 py-1.5 rounded-md font-medium transition-colors ${
                variant === 'danger'
                  ? 'bg-status-danger text-white hover:bg-status-danger/80'
                  : 'bg-status-warning text-bg-primary hover:bg-status-warning/80'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast / Notification ───────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'border-status-success/40 bg-status-success/5',
  error: 'border-status-danger/40 bg-status-danger/5',
  warning: 'border-status-warning/40 bg-status-warning/5',
  info: 'border-accent-cyan/40 bg-accent-cyan/5',
};

const toastIconColor = {
  success: 'text-status-success',
  error: 'text-status-danger',
  warning: 'text-status-warning',
  info: 'text-accent-cyan',
};

let toastListeners: ((toasts: ToastData[]) => void)[] = [];
let activeToasts: ToastData[] = [];

export function showToast(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2);
  const toast: ToastData = { id, type, message };
  activeToasts = [...activeToasts, toast];
  toastListeners.forEach((l) => l(activeToasts));

  setTimeout(() => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(activeToasts));
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs animate-slide-up ${toastStyles[toast.type]}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${toastIconColor[toast.type]}`} />
            <span className="text-text-primary">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Copy Button ────────────────────────────────────────

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn-secondary text-xs flex items-center gap-1.5">
      {copied ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

// ─── Loading Spinner ────────────────────────────────────

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={`${sizes[size]} text-accent-cyan animate-spin`} />;
}

// ─── Empty State ────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-text-secondary" />
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm">{description}</p>
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  prefix?: string;
  icon?: React.ReactNode;
}

export function KPICard({ label, value, subtitle, change, changeType = 'neutral', prefix, icon }: KPICardProps) {
  const changeColor = {
    positive: 'text-status-success',
    negative: 'text-status-danger',
    neutral: 'text-text-secondary',
  };

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-2">
        <span className="section-label text-[10px]">{prefix && <span className="text-accent-cyan mr-1">●</span>}{label}</span>
        {change && <span className={`text-[10px] font-mono ${changeColor[changeType]}`}>{change}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-text-primary tracking-tight">{value}</span>
        {icon}
      </div>
      {subtitle && <p className="text-[10px] font-mono text-text-secondary mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-[10px] font-mono text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-danger',
    planned: 'badge-warning',
    approved: 'badge-teal',
    spent: 'badge-cyan',
    cancelled: 'badge-danger',
  };

  return <span className={styles[status.toLowerCase()] ?? 'badge-cyan'}>{status.toUpperCase()}</span>;
}

// ─── Pagination ─────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn-secondary text-xs px-2 py-1 disabled:opacity-30"
      >
        ←
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let page: number;
        if (totalPages <= 7) {
          page = i + 1;
        } else if (currentPage <= 4) {
          page = i + 1;
        } else if (currentPage >= totalPages - 3) {
          page = totalPages - 6 + i;
        } else {
          page = currentPage - 3 + i;
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              page === currentPage
                ? 'bg-accent-cyan text-bg-primary font-bold'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn-secondary text-xs px-2 py-1 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
}
