import Service from '../models/Service.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all services with pagination
export const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'Active' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { serviceCode: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }

    const services = await Service.find(filter)
      .populate('createdBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: services,
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
      message: 'Error fetching services',
      error: error.message,
    });
  }
};

// Get single service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('createdBy', 'username');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message,
    });
  }
};

// Create new service
export const createService = async (req, res) => {
  try {
    const { serviceCode, serviceName, servicePrice, serviceDescription } = req.body;

    // Validation
    if (!serviceCode || !serviceName || servicePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Service code, name, and price are required',
      });
    }

    // Check code uniqueness
    const existingService = await Service.findOne({ serviceCode: serviceCode.toUpperCase() });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service code already exists',
      });
    }

    // Validate price
    if (servicePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Service price must be positive',
      });
    }

    const service = await Service.create({
      serviceCode: serviceCode.toUpperCase(),
      serviceName,
      servicePrice,
      serviceDescription: serviceDescription || '',
      createdBy: req.session.adminId,
    });

    await logActivity(req.session.adminId, 'CREATE', 'Service', service._id, `Service created: ${serviceCode}`);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message,
    });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceCode, serviceName, servicePrice, serviceDescription, status } = req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check code uniqueness if changed
    if (serviceCode && serviceCode.toUpperCase() !== service.serviceCode) {
      const existingService = await Service.findOne({ serviceCode: serviceCode.toUpperCase() });
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: 'Service code already exists',
        });
      }
    }

    // Validate price if provided
    if (servicePrice !== undefined && servicePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Service price must be positive',
      });
    }

    // Update fields
    if (serviceCode) service.serviceCode = serviceCode.toUpperCase();
    if (serviceName) service.serviceName = serviceName;
    if (servicePrice !== undefined) service.servicePrice = servicePrice;
    if (serviceDescription !== undefined) service.serviceDescription = serviceDescription;
    if (status) service.status = status;

    await service.save();

    await logActivity(req.session.adminId, 'UPDATE', 'Service', service._id, `Service updated: ${service.serviceCode}`);

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message,
    });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const serviceCode = service.serviceCode;
    await Service.findByIdAndDelete(id);

    await logActivity(req.session.adminId, 'DELETE', 'Service', id, `Service deleted: ${serviceCode}`);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message,
    });
  }
};

// Get all active services (for dropdowns)
export const getActiveServices = async (req, res) => {
  try {
    const services = await Service.find({ status: 'Active' }).sort({ serviceName: 1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message,
    });
  }
};
