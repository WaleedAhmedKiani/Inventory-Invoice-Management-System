import { useMutation } from "@tanstack/react-query";
import { createInvoice } from "../services/invoice.service";

export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: createInvoice,
  });
};