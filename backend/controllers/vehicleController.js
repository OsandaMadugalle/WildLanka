import Vehicle from '../models/Vehicle.js';

// Get driver's vehicles
const getDriverVehicles = async (req, res) => {
    try {
        const driverId = req.user._id;
        
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can view their vehicles." 
            });
        }
        
        const vehicles = await Vehicle.find({ 
            driverId: driverId,
            isActive: true
        }).sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            vehicles: vehicles 
        });
    } catch (error) {
        console.log("Get driver vehicles error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Add new vehicle
const addVehicle = async (req, res) => {
    try {
        const driverId = req.user._id;
        
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can add vehicles." 
            });
        }
        
        const newVehicle = new Vehicle({
            ...req.body,
            driverId,
            createdBy: driverId
        });
        
        await newVehicle.save();
        
        res.json({ 
            success: true, 
            message: "Vehicle added successfully",
            vehicle: newVehicle 
        });
    } catch (error) {
        console.log("Add vehicle error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const driverId = req.user._id;
        
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can update vehicles." 
            });
        }
        
        const vehicle = await Vehicle.findById(vehicleId);
        
        if (!vehicle || vehicle.driverId.toString() !== driverId.toString()) {
            return res.status(404).json({ 
                success: false, 
                message: "Vehicle not found" 
            });
        }
        
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            req.body,
            { new: true }
        );
        
        res.json({ 
            success: true, 
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle 
        });
    } catch (error) {
        console.log("Update vehicle error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete vehicle (soft delete)
const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const driverId = req.user._id;
        
        if (req.user.role !== 'driver') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Only drivers can delete vehicles." 
            });
        }
        
        const vehicle = await Vehicle.findById(vehicleId);
        
        if (!vehicle || vehicle.driverId.toString() !== driverId.toString()) {
            return res.status(404).json({ 
                success: false, 
                message: "Vehicle not found" 
            });
        }
        
        vehicle.isActive = false;
        vehicle.isAvailable = false;
        await vehicle.save();
        
        res.json({ 
            success: true, 
            message: "Vehicle deleted successfully"
        });
    } catch (error) {
        console.log("Delete vehicle error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export { 
    getDriverVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
};
