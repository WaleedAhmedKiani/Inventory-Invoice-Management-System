import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../services/product.service";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};