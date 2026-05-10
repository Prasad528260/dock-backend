import SimulationSession from '../models/SimulationSession.js';
import Dock from '../models/Dock.js';
import Truck from '../models/Truck.js';
import { startSimLoop, pauseSimLoop, resetSimLoop } from '../services/simulationService.js';
import { computeSessionMetrics } from '../services/analyticsService.js';
import { closeGate as closeGateService, openGate as openGateService } from '../services/simulationService.js';
import { getIO } from '../socket/socketHandler.js';


export const startSimulation = async (req, res) => {
    try {
        const { dockCount = 3, arrivalFrequency = 5, delayProbability = 0.2, priorityFrequency = 0.3, simSpeed = 1 } = req.body;

        const session = new SimulationSession({
            config: { dockCount, arrivalFrequency, delayProbability, priorityFrequency, simSpeed },
            status: 'running',
            startedAt: new Date()
        });
        await session.save();

        await Dock.insertMany(Array.from({ length: dockCount }, (_, i) => ({
            dockId: `DOCK-${session._id}-${i + 1}`,
            dockNumber: i + 1,
            sessionId: session._id,
            status: 'available'
        })));
        startSimLoop(session);

        res.json({ message: 'Simulation started', data: session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const pauseSimulation = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await SimulationSession.findByIdAndUpdate(sessionId, { status: 'paused' }, { new: true });
        pauseSimLoop();
        res.json({ message: 'Simulation paused', data: session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resumeSimulation = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await SimulationSession.findByIdAndUpdate(sessionId, { status: 'running' }, { new: true });
        startSimLoop(session);
        res.json({ message: 'Simulation resumed', data: session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetSimulation = async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        const metrics = await computeSessionMetrics(sessionId);

        await SimulationSession.findByIdAndUpdate(sessionId, {
            status: 'reset',
            endedAt: new Date(),
            results: {
                totalTrucks: metrics.totalTrucks,
                completedTrucks: metrics.completedTrucks,
                avgWaitTime: metrics.avgWaitTime,
                totalDelays: metrics.totalDelays,
                throughputRate: metrics.throughputRate,
                avgDockUtilization: metrics.avgDockUtilization,
                waitTimeDistribution: metrics.waitTimeDistribution,
                dockUtilization: metrics.dockUtilization,
                avgWaitByPriority: metrics.avgWaitByPriority,
                comparison: metrics.comparison,
            }
        });

        await Truck.deleteMany({ sessionId });
        await Dock.deleteMany({ sessionId });
        resetSimLoop();

        res.json({ success: true, message: 'Session reset' });
    } catch (err) {
        next(err);
    }
};

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await SimulationSession.find().sort({ createdAt: -1 });
        res.json({ message: 'Sessions fetched successfully', data: sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionAnalytics = async (req, res, next) => {
    try {
        const session = await SimulationSession.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const results = session.toObject().results;

        res.json({ 
            success: true, 
            data: {
                ...results,
                config: session.config,
            }
        });
    } catch (err) {
        next(err);
    }
};
export const closeGate = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        closeGateService();
        
        await SimulationSession.findByIdAndUpdate(sessionId, { 
            status: 'closing' 
        });

        getIO().to(sessionId).emit('gate:closed', { 
            message: 'No new trucks. Processing remaining queue.' 
        });

        res.json({ success: true, message: 'Gate closed' });
    } catch (err) {
        next(err);
    }
};
export const openGate = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        openGateService();
        await SimulationSession.findByIdAndUpdate(sessionId, { status: 'running' });
        res.json({ success: true, message: 'Gate opened' });
    } catch (err) {
        next(err);
    }
};