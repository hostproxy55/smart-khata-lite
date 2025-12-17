import { motion } from 'framer-motion';
import { Phone, ChevronRight } from 'lucide-react';
import { Customer } from '@/types/khata';
import { useKhataStore } from '@/store/khataStore';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  index?: number;
}

export const CustomerCard = ({ customer, onClick, index = 0 }: CustomerCardProps) => {
  const { getCustomerTotalDue } = useKhataStore();
  const totalDue = getCustomerTotalDue(customer.id);
  const hasBalance = totalDue !== 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="w-full bg-card rounded-xl p-4 shadow-card border border-border tap-highlight active:scale-[0.98] transition-transform text-left"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
          totalDue > 0 ? 'bg-due-light text-due' : 'bg-payment-light text-payment'
        )}>
          {customer.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-sm">{customer.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {totalDue > 0 ? 'Due' : totalDue < 0 ? 'Advance' : 'Clear'}
            </p>
            <p className={cn(
              'text-lg font-bold',
              totalDue > 0 ? 'text-due' : totalDue < 0 ? 'text-payment' : 'text-payment'
            )}>
              ৳{Math.abs(totalDue).toLocaleString('en-BD')}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </motion.button>
  );
};
