import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../services/customer.service";

export const useCustomers = (page: number, search: string) => {
  return useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => getCustomers(page, search),
  });
};