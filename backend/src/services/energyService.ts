import { PrismaClient } from '@prisma/client';
import { differenceInDays, startOfDay, subDays } from 'date-fns';

const prisma = new PrismaClient();

export const detectAnomalies = async (userId: string, currentReading: number) => {
    const readings = await prisma.energyReading.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 30,
    });

    if (readings.length < 5) return false;

    const amounts = readings.map(r => r.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / amounts.length);

    // Z-score threshold (e.g., 2.5 standard deviations)
    const zScore = (currentReading - avg) / stdDev;
    return Math.abs(zScore) > 2.5;
};

export const predictNextDayConsumption = async (userId: string) => {
    const readings = await prisma.energyReading.findMany({
        where: { userId },
        orderBy: { timestamp: 'asc' },
        take: 60,
    });

    if (readings.length < 7) return null;

    // Simple Linear Regression: y = mx + c
    // x = days from start, y = consumption
    const firstDate = readings[0].timestamp;
    const data = readings.map(r => ({
        x: differenceInDays(r.timestamp, firstDate),
        y: r.amount,
    }));

    const n = data.length;
    const sumX = data.reduce((acc, d) => acc + d.x, 0);
    const sumY = data.reduce((acc, d) => acc + d.y, 0);
    const sumXY = data.reduce((acc, d) => acc + d.x * d.y, 0);
    const sumX2 = data.reduce((acc, d) => acc + d.x * d.x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    const nextDayX = differenceInDays(new Date(), firstDate) + 1;
    return Math.max(0, m * nextDayX + c);
};
