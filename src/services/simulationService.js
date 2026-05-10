
import Truck from '../models/Truck.js';
import { assignTrucks, freeDocks, rescheduleAfterDelay } from './schedulerEngine.js';
import { getIO } from '../socket/socketHandler.js';
let simulationInterval = null;
let gateOpen = true;

export const startSimLoop = async (session) => {
    gateOpen = true;
    const interval = (session.config.arrivalFrequency * 1000) / session.config.simSpeed;

    simulationInterval = setInterval(async () => {
        const simSpeed = session.config.simSpeed;

        await freeDocks(session._id, simSpeed);

        if (!gateOpen) return; // gate closed, skip truck generation

        const isHighPriority = Math.random() < session.config.priorityFrequency;
        const priority = isHighPriority ? 3 : 1;
        const types = ['general', 'perishable', 'hazardous', 'fragile'];
        const shipmentType = types[Math.floor(Math.random() * types.length)];
        const processingDuration = Math.floor(Math.random() * 150) + 30;

        const truck = new Truck({
            truckId: `TRK-${Date.now()}`,
            arrivalTime: new Date(),
            processingDuration,
            priority,
            shipmentType,
            status: 'waiting',
            sessionId: session._id,
        });

        await truck.save();
        await assignTrucks(session._id, simSpeed);

        getIO().to(session._id.toString()).emit('sim:tick', {
            truck: {
                _id: truck._id.toString(),
                truckId: truck.truckId,
                arrivalTime: truck.arrivalTime,
                processingDuration: truck.processingDuration,
                priority: truck.priority,
                shipmentType: truck.shipmentType,
                status: truck.status,
                sessionId: truck.sessionId.toString(),
            }
        });

        if (Math.random() < session.config.delayProbability) {
            const delay = Math.floor(Math.random() * 60) + 15;
            if (truck.assignedDock) {
                await rescheduleAfterDelay(session._id, truck.assignedDock, delay, simSpeed);
            }
        }
    }, interval);
};

export const closeGate = () => {
    gateOpen = false;
};

export const pauseSimLoop = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
};

export const resetSimLoop = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    gateOpen = true;
};
export const openGate = () => {
    gateOpen = true;
};