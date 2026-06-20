import { api } from "../lib/api";

export const createInvoice = async (data: any) => {
  const res = await api.post("/invoices", data);
  return res.data.invoice;
};

export const getInvoices = async (page = 1,  status = "ALL", search = "", sortBy = "createdAt", order = "desc") => {
  const res = await api.get(`/invoices?page=${page}&status=${status}&search=${search}&sortBy=${sortBy}&order=${order}`);
  return res.data;
};

export const getInvoiceById = async (id: string) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};

export const downloadInvoicePdf = async (id: string) => {
  const res = await api.get(`/invoices/${id}/pdf`, {
    responseType: "blob", // VERY IMPORTANT
  });

  return res.data;
};

export const cancelInvoice = async (id: string) => {
  const res = await api.patch(`/invoices/${id}/cancel`);
  return res.data;
};

export const markInvoicePaid = async (id: string) => {
  const res = await api.patch(`/invoices/${id}/pay`);
  return res.data;
};

export const deleteInvoice = async (id: string) => {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
};