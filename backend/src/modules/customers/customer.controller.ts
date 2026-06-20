import { Request, Response } from "express";
import * as service from "./customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation.js";

export const CreateCustomer = async (req: Request, res: Response) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    const customer = await service.createCustomer(data, req.user);

    res.status(201).json({ message: "Customer created successfully", ...customer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await service.getCustomers(req.user, req.query);
    res.json({ message: "Customers retrieved successfully", ...customers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const data = updateCustomerSchema.parse(req.body);

    const customer = await service.updateCustomer(
      req.params.id,
      data,
      req.user
    );

    res.json({ message: "Customer updated successfully", customer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const result = await service.deleteCustomer(
      req.params.id,
      req.user
    );

    res.json({ message: "Customer deleted successfully", result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};