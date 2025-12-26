import { cn } from '@/lib/utils';
import type { AppointmentStatus, LabOrderStatus, PaymentStatus } from '@/types/hms';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Activity,
  Stethoscope,
  CalendarCheck
} from 'lucide-react';

interface StatusBadgeProps {
  status: AppointmentStatus | LabOrderStatus | PaymentStatus | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { 
  label: string; 
  className: string; 
  icon: React.ElementType 
}> = {
  // Appointment Status
  scheduled: {
    label: 'Scheduled',
    className: 'status-scheduled',
    icon: CalendarCheck,
  },
  checked_in: {
    label: 'Checked In',
    className: 'status-checked-in',
    icon: Clock,
  },
  vitals_done: {
    label: 'Vitals Done',
    className: 'status-vitals-done',
    icon: Activity,
  },
  in_consultation: {
    label: 'In Consultation',
    className: 'status-in-consultation',
    icon: Stethoscope,
  },
  completed: {
    label: 'Completed',
    className: 'status-completed',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'status-cancelled',
    icon: XCircle,
  },
  no_show: {
    label: 'No Show',
    className: 'status-cancelled',
    icon: AlertCircle,
  },
  // Lab Order Status
  requested: {
    label: 'Requested',
    className: 'status-scheduled',
    icon: Clock,
  },
  sample_collected: {
    label: 'Sample Collected',
    className: 'status-checked-in',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    className: 'status-vitals-done',
    icon: Activity,
  },
  result_pending: {
    label: 'Result Pending',
    className: 'status-in-consultation',
    icon: Clock,
  },
  published: {
    label: 'Published',
    className: 'status-completed',
    icon: CheckCircle2,
  },
  // Payment Status
  pending: {
    label: 'Pending',
    className: 'status-checked-in',
    icon: Clock,
  },
  partial: {
    label: 'Partial',
    className: 'status-vitals-done',
    icon: AlertCircle,
  },
  paid: {
    label: 'Paid',
    className: 'status-completed',
    icon: CheckCircle2,
  },
  refunded: {
    label: 'Refunded',
    className: 'status-cancelled',
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'status-badge',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
      )} />}
      {config.label}
    </span>
  );
}
