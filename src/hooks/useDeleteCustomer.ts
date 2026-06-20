import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCustomer } from "../services/customer.service";

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
};