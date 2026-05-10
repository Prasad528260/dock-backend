import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
    truckId: {
        type: String,
        required: true,
        unique: true
    },
    arrivalTime: {
        type: Date,
        default: Date.now
    },
    processingDuration: {
        type: Number,
        required: true
    },
    priority: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },
    shipmentType: {
        type: String,
        enum: ['general', 'perishable', 'hazardous', 'fragile'],
        default: 'general'
    },
    status: {
        type: String,
        enum: ['waiting', 'assigned', 'processing', 'delayed', 'completed'],
        default: 'waiting'
    },
    assignedDock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dock',
        default: null
    },
    assignedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    waitTime: { type: Number, default: 0 },
    wasDelayed: { type: Boolean, default: false },
    delayDuration: { type: Number, default: 0 },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SimulationSession',
        default: null
    }
}, { timestamps: true });

const Truck = mongoose.model('Truck', truckSchema);
export default Truck;