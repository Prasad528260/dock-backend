<div align="center">

# 🚛 DockScheduler

### Real-Time Warehouse Dock Optimization Platform

*Intelligent truck scheduling. Dynamic rescheduling. Proven results.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge&logo=vercel)](https://dock-frontend-five.vercel.app)
[![Backend](https://img.shields.io/badge/Backend%20API-Online-green?style=for-the-badge&logo=render)](https://dock-backend-7xci.onrender.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)

</div>

---

## 🔥 What Is This?

Warehouses deal with a brutal scheduling problem every day — dozens of trucks, limited docks, urgent shipments stuck behind slow ones, and zero real-time visibility.

**DockScheduler** solves this with a real-time optimization engine that:

- 🧠 Assigns trucks to docks using **Priority Queue + Greedy Scheduling**
- ⚡ Responds to delays **instantly** via dynamic rescheduling
- 📊 **Proves its value** by comparing against naive FIFO scheduling
- 🔴 Updates every client **live** via WebSockets — no refresh, no polling

> In one test session: our scheduler served high-priority trucks **1m 41s faster** than FIFO would have.

---

## ✨ Features

### 🖥️ Live Dashboard
Real-time warehouse control room. Dock bays animate as trucks pull in and leave. Every event — assignments, delays, completions — appears instantly in the event log without a page refresh.

### ⚙️ Simulation Engine
Run realistic warehouse scenarios with full control:
- Set dock count, arrival rate, delay probability, priority mix
- 1x → 5x simulation speed
- **Close Gate** — stops new arrivals and drains the existing queue naturally

### 🧮 Scheduling Algorithms

```
Truck arrives
    → pushed into Priority Queue (sorted by urgency + job length)
    → Greedy Scheduler scans available docks
    → assigns top of queue to earliest-free dock
    → Delay hits? → re-sort queue → reassign → continue
```

| Algorithm | Purpose | Complexity |
|---|---|---|
| Priority Queue | Sort trucks by urgency | O(log n) |
| Greedy Assignment | Earliest-free dock selection | O(d) |
| Shortest Job First | Tie-break same-priority trucks | O(1) |
| Dynamic Rescheduling | Re-optimize after disruptions | O(n log n) |

### 📈 Analytics & FIFO Comparison
After each session, see the full breakdown:
- Average wait time per truck
- Throughput rate (trucks/min)
- Dock utilization per bay
- Wait time distribution across buckets
- **Side-by-side comparison vs FIFO** — with exact seconds saved

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  Zustand · Framer Motion · Recharts │
└──────────┬──────────────────────────┘
           │ REST API + WebSocket
┌──────────▼──────────────────────────┐
│         Node.js + Express           │
│  Scheduler Engine · Simulation Loop │
│  Socket.IO · Analytics Service      │
└──────────┬──────────────────────────┘
           │ Mongoose ODM
┌──────────▼──────────────────────────┐
│            MongoDB                  │
│  Truck · Dock · SimulationSession   │
└─────────────────────────────────────┘
```

**Real-time cycle:**
```
User action → API call → DB update → Socket emit → Zustand update → UI re-renders
```

**Socket events:**
`truck:assigned` · `truck:completed` · `dock:updated` · `delay:triggered` · `sim:tick` · `gate:closed`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| Real-time | Socket.IO |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Deployment | Vercel + Render |

---

## 🚀 Running Locally

**Prerequisites:** Node.js 18+, MongoDB

```bash
# Backend
git clone https://github.com/Prasad528260/dock-backend
cd dock-backend
npm install
npm run dev        # :5000

# Frontend
git clone https://github.com/Prasad528260/dock-frontend
cd dock-frontend
npm install
npm run dev        # :5173
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/          # Truck, Dock, SimulationSession
│   ├── controllers/     # truck, dock, simulation
│   ├── routes/          # REST API routes
│   ├── services/
│   │   ├── schedulerEngine.js   ← core DSA logic
│   │   ├── simulationService.js ← sim loop + gate control
│   │   └── analyticsService.js  ← metrics + FIFO comparison
│   ├── socket/          # Socket.IO event handling
│   └── utils/           # PriorityQueue implementation
└── server.js

frontend/
├── src/
│   ├── components/      # DockCard, TruckCard, EventLog, etc.
│   ├── pages/           # Dashboard, Simulation, Analytics
│   ├── hooks/           # useSocket
│   ├── store/           # Zustand global store
│   ├── services/        # axios instance + socket client
│   └── utils/           # formatters
```

---

<div align="center">

Built by [Prasad](https://github.com/Prasad528260)

⭐ Star this repo if you found it useful

</div>
