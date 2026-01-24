import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { detectAnomalies, predictNextDayConsumption } from '../services/energyService';
import { startOfDay, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

export const addReading = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const getReadings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const readings = await prisma.energyReading.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 100,
        });
        res.json(readings);
    } catch (error) {
        next(error);
    }
};

export const getConsumptionSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const sevenDaysAgo = subDays(new Date(), 7);
        
        // Single query for all readings in the last 7 days
        const readings = await prisma.energyReading.findMany({
            where: {
                userId,
                timestamp: { gte: sevenDaysAgo }
            },
            orderBy: { timestamp: 'asc' }
        });

        // Group by day in memory for simplicity (since it's only 7 days of data)
        const daysMap: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const date = subDays(new Date(), i);
            daysMap[format(date, 'EEE')] = 0;
        }

        readings.forEach(r => {
            const dayName = format(r.timestamp, 'EEE');
            if (daysMap[dayName] !== undefined) {
                daysMap[dayName] += r.amount;
            }
        });

        const summary = Object.entries(daysMap).map(([name, consumption]) => ({ name, consumption })).reverse();
        res.json(summary);
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const dayAgo = subDays(new Date(), 1);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [currentUsage, prediction, activeAlerts, monthlySpent, budget] = await Promise.all([
            prisma.energyReading.aggregate({
                where: { userId, timestamp: { gte: dayAgo } },
                _sum: { amount: true }
            }),
            predictNextDayConsumption(userId),
            prisma.alert.count({
                where: { userId, seen: false }
            }),
            prisma.energyReading.aggregate({
                where: { userId, timestamp: { gte: startOfMonth } },
                _sum: { amount: true }
            }),
            prisma.budget.findFirst({
                where: { userId, period: 'Monthly' }
            })
        ]);

        res.json({
            currentUsage: (currentUsage._sum.amount || 0).toFixed(1),
            prediction: prediction ? prediction.toFixed(1) : 'N/A',
            alertCount: activeAlerts,
            monthlySpent: (monthlySpent._sum.amount || 0).toFixed(1),
            budgetLimit: budget?.limit || 0
        });
    } catch (error) {
        next(error);
    }
};

export const updateBudget = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { limit, period = 'Monthly' } = req.body;
        const userId = req.user!.userId;

        await prisma.budget.deleteMany({ where: { userId, period } });
        const budget = await prisma.budget.create({
            data: { userId, limit, period },
        });

        res.json(budget);
    } catch (error) {
        next(error);
    }
};

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

export const markAlertAsSeen = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const alert = await prisma.alert.update({
            where: { id: id as string },
            data: { seen: true },
        });
        res.json(alert);
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const getSustainabilityMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        next(error);
    }
};
