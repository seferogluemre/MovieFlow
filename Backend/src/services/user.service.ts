import prisma from "src/config/db";
import { CreateUserType, UpdateUserType } from "src/validators/user.validation";
import bcryptjs from 'bcryptjs'
import { USER_WHERE_CLAUSE } from "src/constants/user.constant";
import { UserQueryProps } from "src/types/types";
import { string } from "zod";

export class UserService {

    static async index(query: UserQueryProps) {
        const users = await prisma.user.findMany({
            where: USER_WHERE_CLAUSE(query),
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                isAdmin: true,
                password: true,
                profileImage: true,
                createdAt: true,
            }
        })
        return users;
    }

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

    static async get(id?: number) {
        if (!id) {
            return { message: "Incorrect id or email submission" };
        }


        return await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                profileImage: true,
                isAdmin: true,
                friends: true,
                friendsOf: true,
                library: true,
                reviews: true,
                ratings: true,
                wishlist: true,
                watchlist: true,
                createdAt: true,
            }
        });
    }

    static async getUserByEmail(email?: string) {
        return await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                profileImage: true,
                password: true,
                isAdmin: true,
                friends: true,
                friendsOf: true,
                library: true,
                reviews: true,
                ratings: true,
                wishlist: true,
                watchlist: true,
                createdAt: true,
            }
        });
    }

    static async update(id: number, body: UpdateUserType) {
        if (!id) {
            return { message: "ID is required" }
        }
        return await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                name: body.name,
                username: body.username,
                password: body.password,
                email: body.email,
            }
        })
    }

    static async delete(id: number) {
        if (!id) {
            return { message: "ID is required" }
        }

        return await prisma.user.delete({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                username: true,
            }
        })
    }
}