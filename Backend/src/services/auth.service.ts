import prisma from "src/config/db";

export class AuthService {
    static async create(userId: number) {
        const now = new Date();
        const expiresIn = 15 * 60; // 15 dakika
        const expiresAt = new Date(now.getTime() + expiresIn * 1000);

        return await prisma.session.create({
            data: {
                userId: userId,
                createdAt: now,
                updatedAt: now,
                expiresAt,
                revokedAt: null,
            },
        });
    }

    static async get(userId: number) {
        try {
            return await prisma.session.findFirst({
                where: {
                    userId,
                    revokedAt: null,
                },
            });
        } catch (error) {
            console.error("Hata tespit edildi", error)
        }
    }

    static async update(sessionId: number) {
        try {
            return await prisma.session.update({
                where: { id: sessionId },
                data: { revokedAt: new Date() },
            });
        } catch (error) {
            console.error("Hata tespit edildi", error)
        }
    }
}