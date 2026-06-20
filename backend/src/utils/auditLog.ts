import { prisma } from "../config/db.js";

export const createAuditLog = async ({
    action,
    entity,
    entityId,
    userId,
    organizationId,
}: {
    action: string;
    entity: string;
    entityId?: string;
    userId: string;
    organizationId: string;
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                organizationId,
            },
        });
    } catch (error) {
        console.error("Audit Log Failed:", error);
    }
};