import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  amount: number;
  variant: 'due' | 'payment' | 'neutral';
  delay?: number;
}

export const SummaryCard = ({ icon: Icon, label, amount, variant, delay = 0 }: SummaryCardProps) => {
  const variantStyles = {
    due: 'bg-due-light border-due/20',
    payment: 'bg-payment-light border-payment/20',
    neutral: 'bg-primary-light border-primary/20',
  };

  const iconStyles = {
    due: 'bg-due text-due-foreground',
    payment: 'bg-payment text-payment-foreground',
    neutral: 'bg-primary text-primary-foreground',
  };

  const amountStyles = {
    due: 'text-due',
    payment: 'text-payment',
    neutral: 'text-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'rounded-xl p-4 border shadow-card',
        variantStyles[variant]
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-xl', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{label}</p>
          <p className={cn('text-2xl font-bold tracking-tight', amountStyles[variant])}>
            ৳{amount.toLocaleString('en-BD')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
