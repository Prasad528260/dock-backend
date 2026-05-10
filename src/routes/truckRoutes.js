import express from 'express';
import { createTruck, getAllTrucks, triggerDelay } from '../controllers/truckController.js';

const truckRouter = express.Router();

truckRouter.post('/', createTruck);
truckRouter.get('/', getAllTrucks);
truckRouter.post('/delay', triggerDelay);

export default truckRouter;