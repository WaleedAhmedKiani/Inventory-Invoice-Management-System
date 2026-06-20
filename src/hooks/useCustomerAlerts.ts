import { useQuery } from "@tanstack/react-query";
import { getCustomerAlerts } from "../services/customerAlert.service";

export const useCustomerAlerts = () => {
    return useQuery({
        queryKey: ["customer-alerts"],
        queryFn: getCustomerAlerts,
    });
};