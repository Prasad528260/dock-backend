import mongoose from 'mongoose';

const dockSchema = new mongoose.Schema({
    dockId: {
        type: String,
        required: true,
        unique: true
    },
    dockNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    currentTruck: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
        default: null
    },
    estimatedFreeAt: {
        type: Date,
        default: null
    },
    totalTrucksHandled: { type: Number, default: 0 },
    totalProcessingTime: { type: Number, default: 0 },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SimulationSession',
        default: null
    }
}, { timestamps: true });

const Dock = mongoose.model('Dock', dockSchema);
export default Dock;
