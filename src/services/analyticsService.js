import Truck from "../models/Truck.js";
import Dock from "../models/Dock.js";
import SimulationSession from "../models/SimulationSession.js";

export const computeSessionMetrics = async (sessionId) => {
  const [trucks, docks, session] = await Promise.all([
    Truck.find({ sessionId }),
    Dock.find({ sessionId }),
    SimulationSession.findById(sessionId),
  ]);

  const completedTrucks = trucks.filter((t) => t.status === "completed");
  const delayedTrucks = trucks.filter((t) => t.wasDelayed);

  // avg wait time
  const avgWaitTime = completedTrucks.length
    ? completedTrucks.reduce((sum, t) => sum + t.waitTime, 0) /
      completedTrucks.length
    : 0;

  // throughput — trucks per minute
  const sessionDuration = session.endedAt
    ? (new Date(session.endedAt) - new Date(session.startedAt)) / 60000
    : (Date.now() - new Date(session.startedAt)) / 60000;

  const throughputRate =
    sessionDuration > 0 ? completedTrucks.length / sessionDuration : 0;

  // dock utilization per dock
  const dockUtilization = docks.map((dock) => ({
    dockId: `Dock ${dock.dockNumber}`,
    dockNumber: dock.dockNumber,
    utilization:
      sessionDuration > 0
        ? Math.min(
            (dock.totalProcessingTime / (sessionDuration * 60)) * 100,
            100,
          )
        : 0,
  }));

  const avgDockUtilization = dockUtilization.length
    ? dockUtilization.reduce((sum, d) => sum + d.utilization, 0) /
      dockUtilization.length
    : 0;

  // wait time distribution buckets
  const buckets = {
    "0-30s": 0,
    "30-60s": 0,
    "1-2min": 0,
    "2-5min": 0,
    "5min+": 0,
  };
  completedTrucks.forEach((t) => {
    if (t.waitTime <= 30) buckets["0-30s"]++;
    else if (t.waitTime <= 60) buckets["30-60s"]++;
    else if (t.waitTime <= 120) buckets["1-2min"]++;
    else if (t.waitTime <= 300) buckets["2-5min"]++;
    else buckets["5min+"]++;
  });

  // priority breakdown
  const priorityStats = {
    high: trucks.filter((t) => t.priority === 3),
    medium: trucks.filter((t) => t.priority === 2),
    low: trucks.filter((t) => t.priority === 1),
  };

  const avgWaitByPriority = {
    high: priorityStats.high.length
      ? priorityStats.high.reduce((s, t) => s + t.waitTime, 0) /
        priorityStats.high.length
      : 0,
    medium: priorityStats.medium.length
      ? priorityStats.medium.reduce((s, t) => s + t.waitTime, 0) /
        priorityStats.medium.length
      : 0,
    low: priorityStats.low.length
      ? priorityStats.low.reduce((s, t) => s + t.waitTime, 0) /
        priorityStats.low.length
      : 0,
  };
  const fifoComparison = simulateFIFO(trucks, session.config.dockCount);
const waitTimeSaved = Math.max(0, fifoComparison.avgWaitTime - avgWaitTime);
const priorityWaitSaved = Math.max(0, fifoComparison.highPriorityAvgWait - avgWaitByPriority.high);

 return {
    totalTrucks: trucks.length,
    completedTrucks: completedTrucks.length,
    avgWaitTime: Math.round(avgWaitTime),
    throughputRate: Math.round(throughputRate * 100) / 100,
    avgDockUtilization: Math.round(avgDockUtilization),
    totalDelays: delayedTrucks.length,
    dockUtilization,
    waitTimeDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
    avgWaitByPriority,
    sessionDuration: Math.round(sessionDuration),
    config: session.config,
    comparison: {
        fifoAvgWaitTime: fifoComparison.avgWaitTime,
        fifoHighPriorityWait: fifoComparison.highPriorityAvgWait,
        waitTimeSaved,
        priorityWaitSaved,
    }
};
};
const simulateFIFO = (trucks, dockCount) => {
    if (!trucks.length) return { avgWaitTime: 0, highPriorityAvgWait: 0 };

    // sort by arrival time only — no priority
    const sorted = [...trucks].sort((a, b) =>
        new Date(a.arrivalTime) - new Date(b.arrivalTime)
    );

    // simulate dock free times
    const dockFreeTimes = Array(dockCount).fill(0);
    let totalWait = 0;
    let highPriorityWait = 0;
    let highPriorityCount = 0;

    sorted.forEach(truck => {
        const arrival = new Date(truck.arrivalTime).getTime();
        
        // find earliest free dock
        const earliestFree = Math.min(...dockFreeTimes);
        const dockIndex = dockFreeTimes.indexOf(earliestFree);
        
        // wait time = max(0, dockFreeTime - arrivalTime)
        const waitTime = Math.max(0, (earliestFree - arrival) / 1000);
        totalWait += waitTime;

        if (truck.priority === 3) {
            highPriorityWait += waitTime;
            highPriorityCount++;
        }

        // dock is now busy until arrival + wait + processing
        dockFreeTimes[dockIndex] = Math.max(earliestFree, arrival) + truck.processingDuration * 1000;
    });

    return {
        avgWaitTime: Math.round(totalWait / sorted.length),
        highPriorityAvgWait: highPriorityCount 
            ? Math.round(highPriorityWait / highPriorityCount) 
            : 0
    };
};
