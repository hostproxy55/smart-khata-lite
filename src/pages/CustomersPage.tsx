import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKhataStore } from '@/store/khataStore';
import { CustomerCard } from '@/components/CustomerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CustomersPage = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, getCustomerTotalDue } = useKhataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    )
    .sort((a, b) => {
      // Sort by due amount (highest first)
      const aDue = getCustomerTotalDue(a.id);
      const bDue = getCustomerTotalDue(b.id);
      return bDue - aDue;
    });

  const totalCustomers = customers.length;
  const customersWithDue = customers.filter((c) => getCustomerTotalDue(c.id) > 0).length;

  const handleAddNewCustomer = () => {
    if (!newCustomerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
    });
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowNewCustomer(false);
    toast.success('Customer added successfully!');
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
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Customers</h1>
          </div>
          <div className="flex gap-4 text-sm text-primary-foreground/80">
            <span>{totalCustomers} Total</span>
            <span>•</span>
            <span>{customersWithDue} With Due</span>
          </div>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 bg-card shadow-card"
          />
        </motion.div>

        {/* Add New Customer */}
        {!showNewCustomer ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              variant="outline"
              className="w-full h-14 mb-4 border-dashed border-2"
              onClick={() => setShowNewCustomer(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Customer
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border mb-4 space-y-3"
          >
            <h3 className="font-semibold text-foreground">New Customer</h3>
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => {
                  setShowNewCustomer(false);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1 h-12" onClick={handleAddNewCustomer}>
                Add Customer
              </Button>
            </div>
          </motion.div>
        )}

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card rounded-xl border border-border"
            >
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No customers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search' : 'Add your first customer'}
              </p>
            </motion.div>
          ) : (
            filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => navigate(`/customers/${customer.id}`)}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
