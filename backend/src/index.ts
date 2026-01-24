import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Specific origin
    credentials: true
}));
app.use(express.json());

// CSRF Protection (Custom header strategy)
app.use((req: Request, res: Response, next: NextFunction) => {
    const method = req.method;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const xRequestedWith = req.header('X-Requested-With');
        // In a real app, you might use a double-submit cookie or stateful CSRF token
        // For this refactor, we rely on SameSite cookie + requirement of custom header
        // which prevents form-based CSRF attacks.
        if (!xRequestedWith && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'CSRF protection: Missing required header' });
        }
    }
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GreenEnergy Backend is running' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        status,
        message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
