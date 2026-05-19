import Car from '../models/Car.js';
import ServiceRecord from '../models/ServiceRecord.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all cars with pagination and filtering
export const getCars = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'Active' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const cars = await Car.find(filter)
      .populate('createdBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Car.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cars',
      error: error.message,
    });
  }
};

// Get single car by ID
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('createdBy', 'username');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Get service history
    const serviceHistory = await ServiceRecord.find({ plateNumber: car._id })
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username')
      .sort({ serviceDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        car,
        serviceHistory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching car',
      error: error.message,
    });
  }
};

// Create new car
export const createCar = async (req, res) => {
  try {
    const { plateNumber, type, model, manufacturingYear, driverPhone, mechanicName } = req.body;

    // Validation
    if (!plateNumber || !type || !model || !manufacturingYear || !driverPhone || !mechanicName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check plate number uniqueness
    const existingCar = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: 'Plate number already exists',
      });
    }

    // Validate phone format
    if (!/^\d{10}$/.test(driverPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Validate manufacturing year
    const currentYear = new Date().getFullYear();
    if (manufacturingYear < 1900 || manufacturingYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Manufacturing year must be between 1900 and ${currentYear}`,
      });
    }

    const car = await Car.create({
      plateNumber: plateNumber.toUpperCase(),
      type,
      model,
      manufacturingYear,
      driverPhone,
      mechanicName,
      createdBy: req.session.adminId,
    });

    await logActivity(req.session.adminId, 'CREATE', 'Car', car._id, `Car created: ${plateNumber}`);

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating car',
      error: error.message,
    });
  }
};

// Update car
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, type, model, manufacturingYear, driverPhone, mechanicName, status } = req.body;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Check plate uniqueness if changed
    if (plateNumber && plateNumber.toUpperCase() !== car.plateNumber) {
      const existingCar = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
      if (existingCar) {
        return res.status(400).json({
          success: false,
          message: 'Plate number already exists',
        });
      }
    }

    // Validate phone if provided
    if (driverPhone && !/^\d{10}$/.test(driverPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits',
      });
    }

    // Validate year if provided
    if (manufacturingYear) {
      const currentYear = new Date().getFullYear();
      if (manufacturingYear < 1900 || manufacturingYear > currentYear) {
        return res.status(400).json({
          success: false,
          message: `Manufacturing year must be between 1900 and ${currentYear}`,
        });
      }
    }

    // Update fields
    if (plateNumber) car.plateNumber = plateNumber.toUpperCase();
    if (type) car.type = type;
    if (model) car.model = model;
    if (manufacturingYear) car.manufacturingYear = manufacturingYear;
    if (driverPhone) car.driverPhone = driverPhone;
    if (mechanicName) car.mechanicName = mechanicName;
    if (status) car.status = status;

    await car.save();

    await logActivity(req.session.adminId, 'UPDATE', 'Car', car._id, `Car updated: ${car.plateNumber}`);

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating car',
      error: error.message,
    });
  }
};

// Delete car
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    const plateNumber = car.plateNumber;
    await Car.findByIdAndDelete(id);

    await logActivity(req.session.adminId, 'DELETE', 'Car', id, `Car deleted: ${plateNumber}`);

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting car',
      error: error.message,
    });
  }
};

// Get cars serviced today
export const getCarsServicedToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await ServiceRecord.find({
      serviceDate: { $gte: today, $lt: tomorrow },
    })
      .populate('plateNumber', 'plateNumber')
      .distinct('plateNumber');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cars serviced today',
      error: error.message,
    });
  }
};
