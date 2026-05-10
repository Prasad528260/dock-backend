import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import truckRoutes from './src/routes/truckRoutes.js';
import dockRoutes from './src/routes/dockRoutes.js';
import simulationRoutes from './src/routes/simulationRoutes.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use('/trucks', truckRoutes);
app.use('/docks', dockRoutes);
app.use('/simulation', simulationRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

export default app;