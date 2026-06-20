import { prisma } from "../../config/db.js";

export const getAuditLogs = async (user: any, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const whereClause = {
        organizationId: user.organizationId,
    };

    // Run parallel queries for maximum performance
    const [total, logs] = await prisma.$transaction([
        prisma.auditLog.count({ where: whereClause }),
        prisma.auditLog.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: skip,
            take: limit,
        })
    ]);

    const formattedLogs = logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userName: log.user.name,
        userEmail: log.user.email,
        createdAt: log.createdAt,
    }));

    return {
        logs: formattedLogs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        }
    };
};