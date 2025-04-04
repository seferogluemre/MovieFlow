import prisma from "src/config/db";
import { CreateUserType } from "src/validators/user.validation";
import bcryptjs from 'bcryptjs'

export class UserService {

    static async create(body: CreateUserType) {
        const hashedPassword = await bcryptjs.hash(body.password, 10)
        return await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                isAdmin: body.isAdmin,
                username: body.username,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                isAdmin: true,
                password: true,
            }
        })
    }

}