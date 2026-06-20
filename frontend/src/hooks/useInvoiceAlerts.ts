import { useQuery } from "@tanstack/react-query";
import { getInvoiceAlerts } from "../services/invoiceAlert.service";


export const useInvoiceAlerts = () => {
    return useQuery({
        queryKey: ["invoice-alerts"],
        queryFn: getInvoiceAlerts,
        
    });
};