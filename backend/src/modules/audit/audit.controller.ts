import { Request, Response } from "express";
import { getAuditLogs } from "./audit.service.js";

export const getAuditLogsController = async (
    req: Request,
    res: Response
) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAuditLogs(req.user, page, limit);

    res.status(200).json({
        success: true,
        ...result,
    });
};