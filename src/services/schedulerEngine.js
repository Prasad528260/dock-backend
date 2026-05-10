import Truck from "../models/Truck.js";
import Dock from "../models/Dock.js";
import PriorityQueue from "../utils/PriorityQueue.js";
import { getIO } from "../socket/socketHandler.js";

const pq = new PriorityQueue();

export const assignTrucks = async (sessionId, simSpeed = 1) => {
  pq.clear();
  const waitingTrucks = await Truck.find({
    sessionId,
    status: "waiting",
  }).sort({ priority: -1, arrivalTime: 1 });

  waitingTrucks.forEach((truck) => pq.enqueue(truck));
  const availableDocks = await Dock.find({
    sessionId,
    status: "available",
  });

  while (!pq.isEmpty() && availableDocks.length > 0) {
    const truck = pq.dequeue();
    const dock = availableDocks.shift();
    const waitTime = (new Date() - truck.arrivalTime) / 1000;
    const estimatedFreeAt = new Date(
      Date.now() + (truck.processingDuration * 1000) / simSpeed,
    );
    await Truck.findByIdAndUpdate(truck._id, {
      status: "assigned",
      assignedDock: dock._id,
      assignedAt: new Date(),
      waitTime,
    });

    await Dock.findByIdAndUpdate(dock._id, {
      status: "occupied",
      currentTruck: truck._id,
      estimatedFreeAt,
    });
    getIO()
      .to(sessionId.toString())
      .emit("truck:assigned", {
        truck: {
          _id: truck._id.toString(),
          truckId: truck.truckId,
          status: "assigned",
          assignedDock: dock._id.toString(),
          waitTime,
          priority: truck.priority,
          shipmentType: truck.shipmentType,
          processingDuration: truck.processingDuration,
        },
        dock: {
          _id: dock._id.toString(),
          dockNumber: dock.dockNumber,
          status: "occupied",
          currentTruck: {
            _id: truck._id.toString(),
            truckId: truck.truckId,
            priority: truck.priority,
            shipmentType: truck.shipmentType,
          },
          estimatedFreeAt,
        },
      });
  }
};

export const rescheduleAfterDelay = async (
  sessionId,
  delay,
  dockId,
  simSpeed = 1,
) => {
  const dock = await Dock.findById(dockId);
  dock.estimatedFreeAt = new Date(
    dock.estimatedFreeAt.getTime() + (delay * 1000) / simSpeed,
  );
  await dock.save();
  getIO().to(sessionId).emit("delay:triggered", {
    dockId,
    newEstimatedFreeAt: dock.estimatedFreeAt,
  });
  await assignTrucks(sessionId, simSpeed);
};

export const freeDocks = async (sessionId, simSpeed = 1) => {
  const now = new Date();

  const expiredDocks = await Dock.find({
    sessionId,
    status: "occupied",
    estimatedFreeAt: { $lte: now },
    currentTruck: { $ne: null },
  });

  for (const dock of expiredDocks) {
    // fetch truck FIRST before any updates
    const truck = await Truck.findById(dock.currentTruck);
    if (!truck) continue;

    // now update truck
    await Truck.findByIdAndUpdate(dock.currentTruck, {
      status: "completed",
      completedAt: now,
    });

    // use truck.processingDuration safely
    await Dock.findByIdAndUpdate(dock._id, {
      status: "available",
      currentTruck: null,
      estimatedFreeAt: null,
      $inc: {
        totalTrucksHandled: 1,
        totalProcessingTime: truck.processingDuration || 0,
      },
    });

    getIO().to(sessionId.toString()).emit("truck:completed", {
      truckId: dock.currentTruck.toString(),
    });

    getIO().to(sessionId.toString()).emit("dock:updated", {
      _id: dock._id.toString(),
      status: "available",
      currentTruck: null,
      estimatedFreeAt: null,
    });
  }

  if (expiredDocks.length > 0) {
    await assignTrucks(sessionId);
  }
};
