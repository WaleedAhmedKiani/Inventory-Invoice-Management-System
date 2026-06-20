import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "../services/invoice.service";

export const useInvoices = (page: number, status: string, search: string, sortBy: string, order: string) => {
  return useQuery({
    queryKey: ["invoices", page, status, search, sortBy, order],
    queryFn: () => getInvoices(page, status, search, sortBy, order),
  });
};