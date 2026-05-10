import http from 'http';
import app from './app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/socket/socketHandler.js';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});