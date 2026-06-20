import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboard.service";

export const useDashboard = (range: string = "7d") => {
  return useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => getDashboard(range),
  });
};