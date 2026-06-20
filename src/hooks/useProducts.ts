import { useQuery } from "@tanstack/react-query";
import { getproducts } from "../services/product.service";

export const useProducts = (page: number, search: string) => {
  return useQuery({
    queryKey: ["products", page, search, "temp-fix"],
    queryFn: () => getproducts(page, search),
  });
};