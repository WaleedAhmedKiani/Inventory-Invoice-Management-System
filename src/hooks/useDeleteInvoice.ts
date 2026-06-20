import { useMutation } from "@tanstack/react-query";
import { deleteInvoice } from "../services/invoice.service";

export const useDeleteInvoice = () => {
  return useMutation({
    mutationFn: deleteInvoice,
  });
};