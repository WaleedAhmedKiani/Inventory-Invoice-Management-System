import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../services/product.service";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      // Refetch product list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};