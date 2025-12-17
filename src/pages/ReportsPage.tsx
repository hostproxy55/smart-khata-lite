import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, FileText, FileSpreadsheet, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useKhataStore } from '@/store/khataStore';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

const ReportsPage = () => {
  const { getTransactionsByDateRange, getCustomerById } = useKhataStore();

  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const transactions = useMemo(() => {
    return getTransactionsByDateRange(new Date(fromDate), new Date(toDate));
  }, [fromDate, toDate, getTransactionsByDateRange]);

  const summary = useMemo(() => {
    const totalDue = transactions
      .filter((t) => t.type === 'due')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayment = transactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDue,
      totalPayment,
      netOutstanding: totalDue - totalPayment,
    };
  }, [transactions]);

  const handleQuickFilter = (days: number | 'thisMonth') => {
    if (days === 'thisMonth') {
      setFromDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
      setToDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    } else {
      setFromDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
      setToDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  const handleExportPDF = () => {
    toast.success('PDF export feature coming soon!');
  };

  const handleExportExcel = () => {
    toast.success('Excel export feature coming soon!');
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
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7" />
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Analyze your business performance
          </p>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Date Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-card border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Date Range</h3>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(7)}
              className="whitespace-nowrap"
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(30)}
              className="whitespace-nowrap"
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('thisMonth')}
              className="whitespace-nowrap"
            >
              This Month
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground">From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <SummaryCard
          icon={TrendingUp}
          label="Total Due Given"
          amount={summary.totalDue}
          variant="due"
          delay={0.1}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Total Payment Collected"
          amount={summary.totalPayment}
          variant="payment"
          delay={0.2}
        />
        <SummaryCard
          icon={Wallet}
          label="Net Outstanding"
          amount={summary.netOutstanding}
          variant="neutral"
          delay={0.3}
        />

        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            variant="outline"
            className="h-14 text-base"
            onClick={handleExportPDF}
          >
            <FileText className="w-5 h-5 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="h-14 text-base"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Export Excel
          </Button>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Transactions ({transactions.length})
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transactions in this period</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try selecting a different date range
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const customer = getCustomerById(transaction.customerId);
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    customer={customer}
                    showCustomer
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
