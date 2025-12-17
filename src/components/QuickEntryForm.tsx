import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Package, Calendar, Check } from 'lucide-react';
import { useKhataStore } from '@/store/khataStore';
import { Customer, Transaction } from '@/types/khata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface QuickEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  preselectedCustomerId?: string;
}

export const QuickEntryForm = ({ 
  isOpen, 
  onClose, 
  editTransaction,
  preselectedCustomerId 
}: QuickEntryFormProps) => {
  const { customers, addCustomer, addTransaction, updateTransaction } = useKhataStore();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    editTransaction?.customerId || preselectedCustomerId || ''
  );
  const [transactionType, setTransactionType] = useState<'due' | 'payment'>(
    editTransaction?.type || 'due'
  );
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [productName, setProductName] = useState(editTransaction?.productName || '');
  const [date, setDate] = useState(
    editTransaction?.date 
      ? format(new Date(editTransaction.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const handleAddNewCustomer = () => {
    if (!newCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    const newCustomer = addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
    });
    setSelectedCustomerId(newCustomer.id);
    setShowNewCustomer(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    toast.success('Customer added!');
  };

  const handleSave = () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const transactionData = {
      customerId: selectedCustomerId,
      type: transactionType,
      amount: parseFloat(amount),
      productName: transactionType === 'due' ? productName.trim() : undefined,
      date: new Date(date),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, transactionData);
      toast.success('Entry updated successfully!');
    } else {
      addTransaction(transactionData);
      toast.success('Entry saved successfully!');
    }
    
    onClose();
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editTransaction ? 'Edit Entry' : 'Quick Entry'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-secondary tap-highlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Customer Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </Label>
                
                {!showNewCustomer ? (
                  <>
                    <Input
                      placeholder="Search customer..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="h-12"
                    />
                    
                    {selectedCustomer && !customerSearch && (
                      <div className="p-3 bg-primary-light rounded-xl border border-primary/20">
                        <p className="font-semibold text-primary">{selectedCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    
                    {customerSearch && (
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setCustomerSearch('');
                            }}
                            className={cn(
                              'w-full p-3 rounded-xl text-left tap-highlight transition-colors',
                              selectedCustomerId === customer.id
                                ? 'bg-primary-light border border-primary/20'
                                : 'bg-secondary hover:bg-secondary/80'
                            )}
                          >
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => setShowNewCustomer(true)}
                    >
                      + Add New Customer
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3 p-4 bg-secondary rounded-xl">
                    <Input
                      placeholder="Customer Name *"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="h-12"
                      autoFocus
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="h-12"
                      type="tel"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={() => setShowNewCustomer(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 h-12"
                        onClick={handleAddNewCustomer}
                      >
                        Add Customer
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Type Toggle */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTransactionType('due')}
                    className={cn(
                      'h-14 rounded-xl font-bold text-lg transition-all tap-highlight',
                      transactionType === 'due'
                        ? 'bg-due text-due-foreground shadow-lg scale-[1.02]'
                        : 'bg-due-light text-due border-2 border-due/30'
                    )}
                  >
                    DUE
                  </button>
                  <button
                    onClick={() => setTransactionType('payment')}
                    className={cn(
                      'h-14 rounded-xl font-bold text-lg transition-all tap-highlight',
                      transactionType === 'payment'
                        ? 'bg-payment text-payment-foreground shadow-lg scale-[1.02]'
                        : 'bg-payment-light text-payment border-2 border-payment/30'
                    )}
                  >
                    PAYMENT
                  </button>
                </div>
              </div>

              {/* Product Name (only for due) */}
              <AnimatePresence>
                {transactionType === 'due' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Product Name
                    </Label>
                    <Input
                      placeholder="e.g., Rice 25kg, Oil 5L"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="h-12"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amount */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-16 pl-12 text-3xl font-bold"
                    autoFocus={!!selectedCustomerId}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="p-4 border-t border-border safe-bottom">
              <Button
                onClick={handleSave}
                className={cn(
                  'w-full h-14 text-lg font-bold',
                  transactionType === 'due' ? 'bg-due hover:bg-due/90' : 'bg-payment hover:bg-payment/90'
                )}
              >
                <Check className="w-5 h-5 mr-2" />
                {editTransaction ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
