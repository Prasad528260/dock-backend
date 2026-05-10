import express from 'express';
import { getAllDocks, initializeDocks } from '../controllers/dockController.js';

const dockRouter = express.Router();

dockRouter.get('/', getAllDocks);
dockRouter.post('/init', initializeDocks);

export default dockRouter;