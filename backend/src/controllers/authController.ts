import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'INDIVIDUAL',
                profile: {
                    create: {
                        name: name || '',
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: { user: { select: { email: true, role: true } } }
        });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const { name, bio, location } = req.body;
        
        const profile = await prisma.profile.update({
            where: { userId },
            data: { name, bio, location }
        });
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
