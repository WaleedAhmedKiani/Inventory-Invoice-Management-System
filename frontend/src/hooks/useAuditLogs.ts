import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../services/audit.service";

export const useAuditLogs = (page: number) => {
    return useQuery({
        queryKey: ["audit-logs", page],
        queryFn: () => getAuditLogs(page),
    });
};