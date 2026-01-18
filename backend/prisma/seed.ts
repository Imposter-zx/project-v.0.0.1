import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@greenenergy.com' },
    update: {},
    create: {
      email: 'demo@greenenergy.com',
      password: hashedPassword,
      role: 'INDIVIDUAL',
      profile: {
        create: {
          name: 'Jan Green',
          bio: 'Energy enthusiast and sustainability advocate.',
          location: 'San Francisco, CA'
        }
      }
    }
  });

  console.log('User created:', user.email);

  // Clear existing readings for this user to avoid duplicates if re-running
  await prisma.energyReading.deleteMany({ where: { userId: user.id } });

  // Generate 30 days of readings
  const readings = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - i);
    
    // Random consumption between 5 and 15 kWh per day
    const amount = parseFloat((Math.random() * 10 + 5).toFixed(2));
    
    readings.push({
      userId: user.id,
      amount,
      timestamp,
      deviceId: 'SMART-METER-HUB'
    });
  }

  await prisma.energyReading.createMany({ data: readings });
  console.log(`Generated ${readings.length} energy readings.`);

  // Create a budget
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.budget.create({
    data: {
      userId: user.id,
      limit: 400,
      period: 'Monthly'
    }
  });

  // Create some mock alerts
  await prisma.alert.create({
    data: {
      userId: user.id,
      type: 'ANOMALY',
      message: 'Unexpected power spike detected on SMART-METER-HUB at 3:00 AM.',
    }
  });

  await prisma.alert.create({
    data: {
      userId: user.id,
      type: 'BUDGET_EXCEEDED',
      message: 'Your energy spending is 10% higher than last week. You may exceed your monthly budget.',
    }
  });

  console.log('Seed data generated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
