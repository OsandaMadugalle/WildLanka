import express from 'express';
import { 
    getDriverVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const vehicleRouter = express.Router();

// Driver vehicle routes (require authentication)
vehicleRouter.get('/driver', auth, getDriverVehicles);
vehicleRouter.post('/driver', auth, addVehicle);
vehicleRouter.put('/driver/:vehicleId', auth, updateVehicle);
vehicleRouter.delete('/driver/:vehicleId', auth, deleteVehicle);

export default vehicleRouter;
