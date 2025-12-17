import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Calendar, Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKhataStore } from '@/store/khataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const QuickEntryPage = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, addTransaction } = useKhataStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'due' | 'payment'>('due');
  const [amount, setAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
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

    addTransaction({
      customerId: selectedCustomerId,
      type: transactionType,
      amount: parseFloat(amount),
      productName: transactionType === 'due' ? productName.trim() : undefined,
      date: new Date(date),
    });

    toast.success('Entry saved successfully!');

    // Reset form
    setAmount('');
    setProductName('');
    setSelectedCustomerId('');
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground p-4"
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 tap-highlight">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Quick Entry</h1>
        </div>
      </motion.header>

      {/* Form */}
      <div className="max-w-lg mx-auto p-4 space-y-5">
        {/* Customer Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
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
                className="h-14 text-lg"
              />

              {selectedCustomer && !customerSearch && (
                <div className="p-4 bg-primary-light rounded-xl border border-primary/20">
                  <p className="font-semibold text-primary text-lg">{selectedCustomer.name}</p>
                  <p className="text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
              )}

              {customerSearch && (
                <div className="max-h-48 overflow-y-auto space-y-2 bg-card rounded-xl border border-border p-2">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No customers found</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setCustomerSearch('');
                        }}
                        className={cn(
                          'w-full p-4 rounded-xl text-left tap-highlight transition-colors',
                          selectedCustomerId === customer.id
                            ? 'bg-primary-light border border-primary/20'
                            : 'bg-secondary hover:bg-secondary/80'
                        )}
                      >
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-14 text-base"
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
                className="h-14 text-lg"
                autoFocus
              />
              <Input
                placeholder="Phone Number"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="h-14 text-lg"
                type="tel"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14"
                  onClick={() => setShowNewCustomer(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 h-14" onClick={handleAddNewCustomer}>
                  Add
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Transaction Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold">Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTransactionType('due')}
              className={cn(
                'h-16 rounded-xl font-bold text-xl transition-all tap-highlight',
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
                'h-16 rounded-xl font-bold text-xl transition-all tap-highlight',
                transactionType === 'payment'
                  ? 'bg-payment text-payment-foreground shadow-lg scale-[1.02]'
                  : 'bg-payment-light text-payment border-2 border-payment/30'
              )}
            >
              PAYMENT
            </button>
          </div>
        </motion.div>

        {/* Product Name (only for due) */}
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
              className="h-14 text-lg"
            />
          </motion.div>
        )}

        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold">Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-20 pl-14 text-4xl font-bold"
            />
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 text-lg"
          />
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            className={cn(
              'w-full h-16 text-xl font-bold',
              transactionType === 'due'
                ? 'bg-due hover:bg-due/90'
                : 'bg-payment hover:bg-payment/90'
            )}
          >
            <Check className="w-6 h-6 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickEntryPage;
