import { Request, Response } from 'express';
import { getRows, addRow, getRowById, updateRow, deleteRow } from '../services/sheets.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { z } from 'zod';

const transactionSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  type: z.enum(['due', 'payment']),
  amount: z.number().min(1, "Amount must be positive"),
  productName: z.string().optional(),
  note: z.string().optional(),
  date: z.string().optional(),
});

const updateTransactionSchema = transactionSchema.partial();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    let transactions = await getRows('Transactions');

    // Filter by customerId if provided in query
    const { customerId } = req.query;
    if (customerId) {
      transactions = transactions.filter((t: any) => t.customerId === customerId);
    }

    // Basic sorting by date desc
    transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Convert amount to number if it's string (Sheets API returns strings)
    transactions = transactions.map((t: any) => ({
      ...t,
      amount: Number(t.amount)
    }));

    sendSuccess(res, transactions);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await getRowById('Transactions', req.params.id);
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    // Convert amount
    transaction.amount = Number(transaction.amount);
    sendSuccess(res, transaction);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const validation = transactionSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Validation Error', 400, validation.error.format());
    }

    const { customerId, type, amount, productName, note, date } = validation.data;
    const newTransaction = {
      id: Math.random().toString(36).substring(2, 15),
      customerId,
      type,
      amount,
      productName: productName || '',
      note: note || '',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await addRow('Transactions', newTransaction);
    sendSuccess(res, newTransaction, 'Transaction created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const validation = updateTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Validation Error', 400, validation.error.format());
    }

    const updated = await updateRow('Transactions', req.params.id, validation.data);
    if (!updated) {
      return sendError(res, 'Transaction not found', 404);
    }
    updated.amount = Number(updated.amount);
    sendSuccess(res, updated, 'Transaction updated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const deleteTransactionController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteRow('Transactions', req.params.id);
    if (!deleted) {
      return sendError(res, 'Transaction not found', 404);
    }
    sendSuccess(res, null, 'Transaction deleted successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
