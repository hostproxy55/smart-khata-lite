import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Transaction, Customer } from '@/types/khata';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
  customer?: Customer;
  showCustomer?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export const TransactionItem = ({
  transaction,
  customer,
  showCustomer = false,
  onEdit,
  onDelete,
  index = 0,
}: TransactionItemProps) => {
  const isDue = transaction.type === 'due';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-xl p-4 shadow-card border border-border"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-2 h-full min-h-[48px] rounded-full',
          isDue ? 'bg-due' : 'bg-payment'
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              isDue ? 'bg-due-light text-due' : 'bg-payment-light text-payment'
            )}>
              {isDue ? 'DUE' : 'PAYMENT'}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(transaction.date), 'dd MMM, hh:mm a')}
            </span>
          </div>
          
          {showCustomer && customer && (
            <p className="font-semibold text-foreground">{customer.name}</p>
          )}
          
          {transaction.productName && (
            <p className="text-sm text-foreground">{transaction.productName}</p>
          )}
          
          {transaction.note && (
            <p className="text-sm text-muted-foreground">{transaction.note}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className={cn(
            'text-lg font-bold',
            isDue ? 'text-due' : 'text-payment'
          )}>
            {isDue ? '+' : '-'}৳{transaction.amount.toLocaleString('en-BD')}
          </p>
          
          {(onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 tap-highlight transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 rounded-lg bg-due-light hover:bg-due/20 tap-highlight transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-due" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
