import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Transaction } from '@/types/khata';

interface KhataStore {
  customers: Customer[];
  transactions: Transaction[];
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Getters
  getCustomerById: (id: string) => Customer | undefined;
  getTransactionsByCustomer: (customerId: string) => Transaction[];
  getCustomerTotalDue: (customerId: string) => number;
  getTodayTransactions: () => Transaction[];
  getTodaySummary: () => { dueGiven: number; paymentCollected: number; totalOutstanding: number };
  getTransactionsByDateRange: (from: Date, to: Date) => Transaction[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useKhataStore = create<KhataStore>()(
  persist(
    (set, get) => ({
      customers: [
        { id: '1', name: 'Rahim Uddin', phone: '01712345678', createdAt: new Date('2024-01-15') },
        { id: '2', name: 'Karim Mia', phone: '01812345678', createdAt: new Date('2024-02-01') },
        { id: '3', name: 'Fatema Begum', phone: '01912345678', createdAt: new Date('2024-02-10') },
        { id: '4', name: 'Abdul Hossain', phone: '01612345678', createdAt: new Date('2024-03-05') },
      ],
      transactions: [
        { id: 't1', customerId: '1', type: 'due', amount: 2500, productName: 'Rice 25kg', date: new Date(), createdAt: new Date() },
        { id: 't2', customerId: '1', type: 'payment', amount: 1000, date: new Date(), createdAt: new Date() },
        { id: 't3', customerId: '2', type: 'due', amount: 3200, productName: 'Cooking Oil', date: new Date(), createdAt: new Date() },
        { id: 't4', customerId: '3', type: 'due', amount: 1800, productName: 'Sugar 10kg', date: new Date(Date.now() - 86400000), createdAt: new Date(Date.now() - 86400000) },
        { id: 't5', customerId: '3', type: 'payment', amount: 1800, date: new Date(), createdAt: new Date() },
        { id: 't6', customerId: '4', type: 'due', amount: 4500, productName: 'Monthly Groceries', date: new Date(Date.now() - 172800000), createdAt: new Date(Date.now() - 172800000) },
      ],

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
        return newCustomer;
      },

      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
          transactions: state.transactions.filter((t) => t.customerId !== id),
        }));
      },

      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      getTransactionsByCustomer: (customerId) => {
        return get()
          .transactions.filter((t) => t.customerId === customerId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getCustomerTotalDue: (customerId) => {
        const transactions = get().transactions.filter(
          (t) => t.customerId === customerId
        );
        return transactions.reduce((total, t) => {
          return t.type === 'due' ? total + t.amount : total - t.amount;
        }, 0);
      },

      getTodayTransactions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get()
          .transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate.getTime() === today.getTime();
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getTodaySummary: () => {
        const todayTransactions = get().getTodayTransactions();
        const allTransactions = get().transactions;

        const dueGiven = todayTransactions
          .filter((t) => t.type === 'due')
          .reduce((sum, t) => sum + t.amount, 0);

        const paymentCollected = todayTransactions
          .filter((t) => t.type === 'payment')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalOutstanding = allTransactions.reduce((total, t) => {
          return t.type === 'due' ? total + t.amount : total - t.amount;
        }, 0);

        return { dueGiven, paymentCollected, totalOutstanding };
      },

      getTransactionsByDateRange: (from, to) => {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        return get()
          .transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            return transactionDate >= fromDate && transactionDate <= toDate;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
    }),
    {
      name: 'smart-khata-storage',
      partialize: (state) => ({
        customers: state.customers,
        transactions: state.transactions,
      }),
    }
  )
);
