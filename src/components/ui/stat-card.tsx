import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    trend: {
      positive: 'text-success',
      negative: 'text-destructive',
    },
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: {
      positive: 'text-success',
      negative: 'text-destructive',
    },
  },
  success: {
    icon: 'bg-success/10 text-success',
    trend: {
      positive: 'text-success',
      negative: 'text-destructive',
    },
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    trend: {
      positive: 'text-success',
      negative: 'text-destructive',
    },
  },
  info: {
    icon: 'bg-info/10 text-info',
    trend: {
      positive: 'text-success',
      negative: 'text-destructive',
    },
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-3xl font-semibold tracking-tight">
            {value}
          </span>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive
                      ? styles.trend.positive
                      : styles.trend.negative
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
