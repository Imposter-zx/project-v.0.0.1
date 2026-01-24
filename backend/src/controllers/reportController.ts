import { Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export const generateEnergyReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        const readings = await prisma.energyReading.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 30,
        });

        const doc = new PDFDocument({ margin: 50 });
        let filename = `GreenEnergy_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc
            .fillColor('#3d9451')
            .fontSize(25)
            .text('GreenEnergy Management Platform', 50, 50)
            .fontSize(10)
            .fillColor('#64748b')
            .text(`Report Date: ${format(new Date(), 'PPP')}`, 50, 80)
            .moveDown();

        // User Info
        doc
            .fillColor('#1e293b')
            .fontSize(16)
            .text('Customer Information', 50, 120)
            .fontSize(12)
            .text(`Name: ${user?.profile?.name || 'Valued Customer'}`)
            .text(`Email: ${user?.email}`)
            .moveDown();

        // Summary
        const totalConsumption = readings.reduce((acc: number, r: any) => acc + r.amount, 0);
        doc
            .fontSize(16)
            .text('Consumption Summary (Last 30 entries)', 50, 190)
            .fontSize(12)
            .text(`Total Consumption: ${totalConsumption.toFixed(2)} kWh`)
            .text(`Average per entry: ${(totalConsumption / (readings.length || 1)).toFixed(2)} kWh`)
            .moveDown();

        // Table Header
        const tableTop = 270;
        doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('Date', 50, tableTop)
            .text('Amount (kWh)', 200, tableTop)
            .text('Device ID', 350, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#e2e8f0');

        // Table Content
        doc.font('Helvetica'); // Reset to normal font
        let i = 0;
        readings.forEach((reading: any) => {
            const y = tableTop + 25 + (i * 20);
            doc
                .fontSize(10)
                .text(format(new Date(reading.timestamp), 'yyyy-MM-dd HH:mm'), 50, y)
                .text(reading.amount.toString(), 200, y)
                .text(reading.deviceId || 'N/A', 350, y);
            i++;
        });

        // Footer
        doc
            .fontSize(10)
            .fillColor('#94a3b8')
            .text(
                'Thank you for using GreenEnergy. Stay sustainable!',
                50,
                700,
                { align: 'center', width: 500 }
            );

        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error });
    }
};
