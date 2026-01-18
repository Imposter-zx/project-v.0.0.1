import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GreenEnergy Backend is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || true) { // Force for now to test build
    const frontendPath = path.join(__dirname, '../../../dist/frontend');
    app.use(express.static(frontendPath));

    app.use((req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(frontendPath, 'index.html'));
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
