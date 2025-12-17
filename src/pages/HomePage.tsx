import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useKhataStore } from '@/store/khataStore';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { QuickEntryForm } from '@/components/QuickEntryForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Transaction } from '@/types/khata';
import { toast } from 'sonner';

const HomePage = () => {
  const { getTodaySummary, getTodayTransactions, getCustomerById, deleteTransaction } = useKhataStore();
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const summary = getTodaySummary();
  const todayTransactions = getTodayTransactions();

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setShowQuickEntry(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTransactionId(id);
  };

  const confirmDelete = () => {
    if (deleteTransactionId) {
      deleteTransaction(deleteTransactionId);
      toast.success('Entry deleted successfully');
      setDeleteTransactionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-3xl"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Smart Khata</h1>
          <p className="text-primary-foreground/80 text-sm">Today's Summary</p>
        </div>
      </motion.header>

      {/* Summary Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-3">
        <SummaryCard
          icon={TrendingUp}
          label="Due Given Today"
          amount={summary.dueGiven}
          variant="due"
          delay={0.1}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Payment Collected Today"
          amount={summary.paymentCollected}
          variant="payment"
          delay={0.2}
        />
        <SummaryCard
          icon={Wallet}
          label="Total Outstanding Due"
          amount={summary.totalOutstanding}
          variant="neutral"
          delay={0.3}
        />
      </div>

      {/* Today's Transactions */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Today's Transactions ({todayTransactions.length})
          </h2>

          {todayTransactions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No transactions today</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap the button below to add one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTransactions.map((transaction, index) => {
                const customer = getCustomerById(transaction.customerId);
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    customer={customer}
                    showCustomer
                    onEdit={() => handleEdit(transaction)}
                    onDelete={() => handleDelete(transaction.id)}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setEditTransaction(null);
          setShowQuickEntry(true);
        }}
        className="fixed bottom-24 right-4 w-16 h-16 bg-primary text-primary-foreground rounded-2xl shadow-lg flex items-center justify-center tap-highlight"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Quick Entry Form */}
      <QuickEntryForm
        isOpen={showQuickEntry}
        onClose={() => {
          setShowQuickEntry(false);
          setEditTransaction(null);
        }}
        editTransaction={editTransaction}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTransactionId}
        onClose={() => setDeleteTransactionId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default HomePage;
