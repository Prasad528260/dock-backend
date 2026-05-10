import Dock from "../models/Dock.js";

export const getAllDocks = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }
    const docks = await Dock.find({ sessionId })
      .sort({ dockNumber: 1 })
      .populate("currentTruck", "truckId priority shipmentType status");
    res.json({ message: "Docks fetched successfully", data: docks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const initializeDocks = async (req, res) => {
  try {
    const { sessionId, dockCount } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }
    if (!dockCount) {
      return res.status(400).json({ message: "Dock count is required" });
    }
    const docks = await Dock.insertMany(
      Array.from({ length: dockCount }, (_, i) => ({
        dockId: `DOCK-${sessionId}-${i + 1}`,
        dockNumber: i + 1,
        sessionId,
        status: "available",
      })),
    );
    res.json({ message: "Docks initialized successfully", data: docks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
