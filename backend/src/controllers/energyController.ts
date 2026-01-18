import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { detectAnomalies, predictNextDayConsumption } from '../services/energyService';
import { startOfDay, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

export const addReading = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, deviceId, timestamp } = req.body;
        const userId = req.user!.userId;

        const reading = await prisma.energyReading.create({
            data: {
                userId,
                amount,
                deviceId,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        // Check for anomalies
        const isAnomaly = await detectAnomalies(userId, amount);
        if (isAnomaly) {
            await prisma.alert.create({
                data: {
                    userId,
                    type: 'ANOMALY',
                    message: `Abnormal energy consumption detected: ${amount} kWh`,
                },
            });
        }

        // Check budget
        const budget = await prisma.budget.findFirst({
            where: { userId, period: 'Monthly' },
        });

        if (budget) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthlyTotal = await prisma.energyReading.aggregate({
                where: {
                    userId,
                    timestamp: { gte: startOfMonth },
                },
                _sum: { amount: true },
            });

            if ((monthlyTotal._sum.amount || 0) > budget.limit) {
                await prisma.alert.create({
                    data: {
                        userId,
                        type: 'BUDGET_EXCEEDED',
                        message: `Monthly budget of ${budget.limit} kWh has been exceeded.`,
                    },
                });
            }
        }

        res.status(201).json({ reading, isAnomaly });
    } catch (error) {
        res.status(500).json({ message: 'Error adding reading', error });
    }
};

export const getReadings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const readings = await prisma.energyReading.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 100,
        });
        res.json(readings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching readings', error });
    }
};

export const getConsumptionSummary = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), i);
            return startOfDay(date);
        }).reverse();

        const summary = await Promise.all(
            last7Days.map(async (date) => {
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1);

                const total = await prisma.energyReading.aggregate({
                    where: {
                        userId,
                        timestamp: {
                            gte: date,
                            lt: nextDay,
                        },
                    },
                    _sum: { amount: true },
                });

                return {
                    name: format(date, 'EEE'),
                    consumption: total._sum.amount || 0,
                };
            })
        );

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary', error });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        // 1. Current Usage (Last 24h)
        const dayAgo = subDays(new Date(), 1);
        const currentUsage = await prisma.energyReading.aggregate({
            where: { userId, timestamp: { gte: dayAgo } },
            _sum: { amount: true }
        });

        // 2. Prediction
        const prediction = await predictNextDayConsumption(userId);

        // 3. Active Alerts
        const alertCount = await prisma.alert.count({
            where: { userId, seen: false }
        });

        // 4. Monthly Budget vs Spent
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlySpent = await prisma.energyReading.aggregate({
            where: { userId, timestamp: { gte: startOfMonth } },
            _sum: { amount: true }
        });

        const budget = await prisma.budget.findFirst({
            where: { userId, period: 'Monthly' }
        });

        res.json({
            currentUsage: (currentUsage._sum.amount || 0).toFixed(1),
            prediction: prediction ? prediction.toFixed(1) : 'N/A',
            alertCount,
            monthlySpent: (monthlySpent._sum.amount || 0).toFixed(1),
            budgetLimit: budget?.limit || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
    try {
        const { limit, period = 'Monthly' } = req.body;
        const userId = req.user!.userId;

        await prisma.budget.deleteMany({ where: { userId, period } });
        const budget = await prisma.budget.create({
            data: { userId, limit, period },
        });

        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget', error });
    }
};

export const getAlerts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts', error });
    }
};

export const markAlertAsSeen = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await prisma.alert.update({
            where: { id: id as string },
            data: { seen: true },
        });
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Error updating alert', error });
    }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const recommendations = await prisma.recommendation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // If none exist, return some defaults
        if (recommendations.length === 0) {
            return res.json([
                { content: 'Shift laundry to 10 PM to 6 AM for 15% lower rates.', impactScore: 0.8 },
                { content: 'A/C usage is 20% higher than similar households.', impactScore: 0.5 },
                { content: 'Switching to LED bulbs could save you $12/month.', impactScore: 0.3 }
            ]);
        }

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recommendations', error });
    }
};

export const getSustainabilityMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        
        const totalConsumption = await prisma.energyReading.aggregate({
            where: { userId },
            _sum: { amount: true },
        });

        const totalKWh = totalConsumption._sum.amount || 0;
        const co2Saved = totalKWh * 0.42; // Example coefficient: 0.42kg CO2 per kWh
        const treesEquivalent = Math.floor(co2Saved / 20); // 1 tree absorbs ~20kg CO2/year

        res.json({
            totalKWh,
            co2Saved,
            treesEquivalent,
            carbonFootprint: totalKWh * 0.52, // higher footprint coefficient
            impactLevel: totalKWh < 100 ? 'Low' : totalKWh < 500 ? 'Moderate' : 'High'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sustainability metrics', error });
    }
};
