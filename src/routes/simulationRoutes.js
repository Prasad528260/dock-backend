import express from 'express';
import { startSimulation, pauseSimulation, resumeSimulation, resetSimulation, getAllSessions, getSessionAnalytics, closeGate, openGate } from '../controllers/simulationController.js';

const router = express.Router();

router.post('/start', startSimulation);
router.post('/pause', pauseSimulation);
router.post('/resume', resumeSimulation);
router.post('/reset', resetSimulation);
router.get('/sessions', getAllSessions);
router.get('/sessions/:id', getSessionAnalytics);
router.post('/close-gate', closeGate);
router.post('/open-gate', openGate);
export default router;