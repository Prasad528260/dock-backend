import mongoose from "mongoose";

const simulationSessionSchema = new mongoose.Schema(
  {
    config: {
      dockCount: { type: Number, default: 3 },
      arrivalFrequency: { type: Number, default: 5 },
      delayProbability: { type: Number, default: 0.2 },
      priorityFrequency: { type: Number, default: 0.3 },
      simSpeed: { type: Number, default: 1 },
    },
    status: {
    type: String,
    enum: ['running', 'paused', 'completed', 'reset', 'closing'],
    default: 'running'
},
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    results: {
      totalTrucks: { type: Number, default: 0 },
      completedTrucks: { type: Number, default: 0 },
      avgWaitTime: { type: Number, default: 0 },
      totalDelays: { type: Number, default: 0 },
      throughputRate: { type: Number, default: 0 },
      avgDockUtilization: { type: Number, default: 0 },
      waitTimeDistribution: { type: Array, default: [] },
      dockUtilization: { type: Array, default: [] },
      avgWaitByPriority: {
        type: Object,
        default: { high: 0, medium: 0, low: 0 },
      },
      comparison: { type: Object, default: {} }
    },
  },
  { timestamps: true },
);

const SimulationSession = mongoose.model(
  "SimulationSession",
  simulationSessionSchema,
);
export default SimulationSession;
