import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type UsageResponse = {
  plan: string;
  limits: {
    products: number | null;
    customers: number | null;
    invoices: number | null;
  };
  usage: {
    products: number;
    customers: number;
    invoices: number;
  };
};

const fetchUsage = async (): Promise<UsageResponse> => {
  const res = await api.get("/usage");
  return res.data;
};

export const usePlan = () => {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["usage"],
    queryFn: fetchUsage,
  });

  const backendPlan = data?.plan || user?.organization?.plan || "FREE";

  const isPro = backendPlan === "PRO";

  return {
    user,
    isLoading,

    plan: backendPlan,
    isPro,
    isFree: !isPro,

    organization: {
      id: user?.organization?.id,
      plan: backendPlan,
      subscription: user?.organization?.subscription,

      limits: data?.limits || {
        products: 10,
        customers: 10,
        invoices: 10,
      },

      usage: data?.usage || {
        products: 0,
        customers: 0,
        invoices: 0,
      },
    },
  };
};