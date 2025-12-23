import { Request, Response } from 'express';
import { getRows, addRow, getRowById, updateRow, deleteRow } from '../services/sheets.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
});

const updateCustomerSchema = customerSchema.partial();

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await getRows('Customers');
    sendSuccess(res, customers);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await getRowById('Customers', req.params.id);
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }
    sendSuccess(res, customer);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validation = customerSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Validation Error', 400, validation.error.format());
    }

    const { name, phone } = validation.data;
    const newCustomer = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      phone,
      createdAt: new Date().toISOString()
    };
    await addRow('Customers', newCustomer);
    sendSuccess(res, newCustomer, 'Customer created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const validation = updateCustomerSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Validation Error', 400, validation.error.format());
    }

    const updated = await updateRow('Customers', req.params.id, validation.data);
    if (!updated) {
      return sendError(res, 'Customer not found', 404);
    }
    sendSuccess(res, updated, 'Customer updated successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteRow('Customers', req.params.id);
    if (!deleted) {
      return sendError(res, 'Customer not found', 404);
    }
    sendSuccess(res, null, 'Customer deleted successfully');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
