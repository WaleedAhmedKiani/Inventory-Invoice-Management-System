import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscription } from "../services/billing.service";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  });
};