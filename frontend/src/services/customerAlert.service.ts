import { api } from "../lib/api";

export const getCustomerAlerts = async () => {
    const { data } = await api.get("/alerts/customers");
    return data;
};