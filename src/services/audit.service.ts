import { api } from "../lib/api";

export const getAuditLogs = async (page: number, limit: number = 10) => {
    const { data } = await api.get(`/audit-logs?page=${page}&limit=${limit}`);
    return data;
};