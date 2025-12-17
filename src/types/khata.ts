export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  customerId: string;
  type: 'due' | 'payment';
  amount: number;
  productName?: string;
  note?: string;
  date: Date;
  createdAt: Date;
}

export interface DailySummary {
  dueGiven: number;
  paymentCollected: number;
  totalOutstanding: number;
}
