import { api } from "../lib/api";
import type { Customer } from "../types/customer.types";

export const getCustomers = async ( page = 1, search = "") => {
  const res = await api.get(`/customers?page=${page}&limit=10&search=${search}`
  );

  return res.data;
};

export const createCustomer = async (
  data: Omit<Customer, "id">
) => {
  const res = await api.post("/customers", data);
  return res.data.customer;
};

export const updateCustomer = async (
  id: string,
  data: Partial<Customer>
) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data.customer;
};

export const deleteCustomer = async (id: string) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};