import { useMutation } from "@tanstack/react-query";
import { cancelInvoice, markInvoicePaid } from "../services/invoice.service";

export const useCancelInvoice = () =>
  useMutation({ mutationFn: cancelInvoice });

export const useMarkPaid = () =>
  useMutation({ mutationFn: markInvoicePaid });