import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Phone, Plus, Minus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKhataStore } from '@/store/khataStore';
import { TransactionItem } from '@/components/TransactionItem';
import { QuickEntryForm } from '@/components/QuickEntryForm';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/khata';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, getTransactionsByCustomer, getCustomerTotalDue, deleteTransaction, deleteCustomer } = useKhataStore();

  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [entryType, setEntryType] = useState<'due' | 'payment'>('due');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const [showDeleteCustomer, setShowDeleteCustomer] = useState(false);

  const customer = id ? getCustomerById(id) : undefined;
  const transactions = id ? getTransactionsByCustomer(id) : [];
  const totalDue = id ? getCustomerTotalDue(id) : 0;

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Customer not found</p>
          <Button onClick={() => navigate('/customers')} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const handleAddEntry = (type: 'due' | 'payment') => {
    setEntryType(type);
    setEditTransaction(null);
    setShowQuickEntry(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setShowQuickEntry(true);
  };

  const handleDelete = (transactionId: string) => {
    setDeleteTransactionId(transactionId);
  };

  const confirmDelete = () => {
    if (deleteTransactionId) {
      deleteTransaction(deleteTransactionId);
      toast.success('Entry deleted successfully');
      setDeleteTransactionId(null);
    }
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(customer.id);
    toast.success('Customer deleted successfully');
    navigate('/customers');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 pb-6',
          totalDue > 0 ? 'bg-due' : 'bg-payment'
        )}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 -ml-2 text-white tap-highlight"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteCustomer(true)}
                className="p-2 rounded-full bg-white/20 tap-highlight"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{customer.name}</h1>
              <div className="flex items-center gap-1 text-white/80">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'No phone'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Total Due Card */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">
              {totalDue > 0 ? 'Total Due' : totalDue < 0 ? 'Advance Payment' : 'Balance'}
            </span>
            <span
              className={cn(
                'text-3xl font-bold',
                totalDue > 0 ? 'text-due' : totalDue < 0 ? 'text-payment' : 'text-payment'
              )}
            >
              ৳{Math.abs(totalDue).toLocaleString('en-BD')}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Transaction History ({transactions.length})
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a due or payment below
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => handleEdit(transaction)}
                  onDelete={() => handleDelete(transaction.id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            onClick={() => handleAddEntry('due')}
            className="flex-1 h-14 bg-due hover:bg-due/90 text-lg font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Due
          </Button>
          <Button
            onClick={() => handleAddEntry('payment')}
            className="flex-1 h-14 bg-payment hover:bg-payment/90 text-lg font-bold"
          >
            <Minus className="w-5 h-5 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Quick Entry Form */}
      <QuickEntryForm
        isOpen={showQuickEntry}
        onClose={() => {
          setShowQuickEntry(false);
          setEditTransaction(null);
        }}
        editTransaction={editTransaction}
        preselectedCustomerId={customer.id}
      />

      {/* Delete Transaction Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTransactionId}
        onClose={() => setDeleteTransactionId(null)}
        onConfirm={confirmDelete}
        title="Delete Entry?"
        message="This action cannot be undone. Are you sure you want to delete this entry?"
      />

      {/* Delete Customer Confirmation */}
      <DeleteConfirmDialog
        isOpen={showDeleteCustomer}
        onClose={() => setShowDeleteCustomer(false)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer?"
        message="This will delete the customer and all their transaction history. This action cannot be undone."
      />
    </div>
  );
};

export default CustomerDetailPage;
