import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { addReading, getReadings, getDashboardStats, getConsumptionSummary, updateBudget, getAlerts, markAlertAsSeen, getRecommendations, getSustainabilityMetrics } from '../controllers/energyController';
import { generateEnergyReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);

// Energy routes
router.post('/energy/reading', authenticate, addReading);
router.get('/energy/readings', authenticate, getReadings);
router.get('/energy/dashboard-stats', authenticate, getDashboardStats);
router.get('/energy/consumption-summary', authenticate, getConsumptionSummary);
router.post('/energy/budget', authenticate, updateBudget);
router.get('/energy/alerts', authenticate, getAlerts);
router.put('/energy/alerts/:id/seen', authenticate, markAlertAsSeen);
router.get('/energy/recommendations', authenticate, getRecommendations);
router.get('/energy/sustainability', authenticate, getSustainabilityMetrics);
router.get('/energy/report', authenticate, generateEnergyReport);

export default router;
