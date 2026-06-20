import { useQuery } from "@tanstack/react-query";
import { getInventoryAlerts } from "../services/inventoryAlert.service";

export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: getInventoryAlerts,
  });
};