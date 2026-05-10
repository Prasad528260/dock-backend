import Truck from '../models/Truck.js';
import SimulationSession from '../models/SimulationSession.js';
import { rescheduleAfterDelay } from '../services/schedulerEngine.js';
import { assignTrucks } from '../services/schedulerEngine.js';

export const createTruck = async (req, res) => {
    try {
        const { processingDuration, priority, shipmentType, sessionId } = req.body;

        
        const truck = new Truck({
            truckId: `TRK-${Date.now()}`,
            processingDuration,
            priority,
            shipmentType,
            sessionId,
            arrivalTime: new Date()
        });
        
        await truck.save();
        await assignTrucks(sessionId);
        
        res.json({ message: 'Truck created successfully', data: truck });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllTrucks = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }
        const trucks = await Truck.find({ sessionId })
            .sort({ priority: -1, arrivalTime: 1 });
        res.json({ message: 'Trucks fetched successfully', data: trucks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const triggerDelay = async (req, res) => {
    try {
        const { delay, dockId, sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }
        await rescheduleAfterDelay(sessionId, delay, dockId);
        res.json({ message: 'Delay triggered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};