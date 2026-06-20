import { api } from "../lib/api";

export const getInvoiceAlerts = async () => {
    const response = await api.get("/alerts/invoices");
    return response.data;
};