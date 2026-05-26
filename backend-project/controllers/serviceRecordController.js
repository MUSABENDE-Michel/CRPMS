import ServiceRecord from '../models/ServiceRecord.js';
import Car from '../models/Car.js';
import Service from '../models/Service.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all service records with pagination
export const getServiceRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { 'plateNumber.plateNumber': { $regex: search, $options: 'i' } },
        { doneBy: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.paymentStatus = status;
    }

    const records = await ServiceRecord.find(filter)
      .populate('plateNumber', 'plateNumber type model')
      .populate('serviceCode', 'serviceName servicePrice serviceCode')
      .populate('createdBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ serviceDate: -1 });

    const total = await ServiceRecord.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get service records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service records',
      error: error.message,
    });
  }
};

// Get single service record
export const getServiceRecordById = async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('plateNumber')
      .populate('serviceCode')
      .populate('createdBy', 'username');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Get service record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service record',
      error: error.message,
    });
  }
};

// Create service record - UPDATED: amountPaid = 0, paymentStatus = 'Unpaid'
export const createServiceRecord = async (req, res) => {
  try {
    const { serviceDate, plateNumber, serviceCode, paymentDate, doneBy } = req.body;

    // Validation
    if (!serviceDate || !plateNumber || !serviceCode || !paymentDate || !doneBy) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate dates
    const serviceDateObj = new Date(serviceDate);
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(serviceDateObj) || isNaN(paymentDateObj)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Validate car exists
    const car = await Car.findById(plateNumber);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Validate service exists
    const service = await Service.findById(serviceCode);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Create record with amountPaid = 0 and paymentStatus = 'Unpaid'
    const record = await ServiceRecord.create({
      serviceDate: serviceDateObj,
      plateNumber,
      serviceCode,
      amountPaid: 0,
      paymentDate: paymentDateObj,
      paymentStatus: 'Unpaid',
      doneBy,
      createdBy: req.session.adminId,
    });

    await logActivity(
      req.session.adminId,
      'CREATE',
      'ServiceRecord',
      record._id,
      `Service record created for car ${car.plateNumber}`
    );

    res.status(201).json({
      success: true,
      message: 'Service record created successfully',
      data: record,
    });
  } catch (error) {
    console.error('Create service record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service record',
      error: error.message,
    });
  }
};

// Update service record
export const updateServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceDate, plateNumber, serviceCode, amountPaid, paymentDate, paymentStatus, doneBy } = req.body;

    const record = await ServiceRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found',
      });
    }

    // Validate payment status if provided
    if (paymentStatus && !['Paid', 'Partial', 'Unpaid'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    // Validate amount if provided
    if (amountPaid !== undefined) {
      const service = await Service.findById(record.serviceCode);
      if (amountPaid < 0 || amountPaid > service.servicePrice) {
        return res.status(400).json({
          success: false,
          message: `Amount paid must be between 0 and ${service.servicePrice}`,
        });
      }
    }

    // Update fields
    if (serviceDate) record.serviceDate = new Date(serviceDate);
    if (plateNumber) record.plateNumber = plateNumber;
    if (serviceCode) record.serviceCode = serviceCode;
    if (amountPaid !== undefined) record.amountPaid = amountPaid;
    if (paymentDate) record.paymentDate = new Date(paymentDate);
    if (paymentStatus) record.paymentStatus = paymentStatus;
    if (doneBy) record.doneBy = doneBy;

    await record.save();

    await logActivity(req.session.adminId, 'UPDATE', 'ServiceRecord', record._id, 'Service record updated');

    res.status(200).json({
      success: true,
      message: 'Service record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('Update service record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service record',
      error: error.message,
    });
  }
};

// Delete service record
export const deleteServiceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await ServiceRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found',
      });
    }

    await ServiceRecord.findByIdAndDelete(id);

    await logActivity(req.session.adminId, 'DELETE', 'ServiceRecord', id, 'Service record deleted');

    res.status(200).json({
      success: true,
      message: 'Service record deleted successfully',
    });
  } catch (error) {
    console.error('Delete service record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service record',
      error: error.message,
    });
  }
};

// Get service records for a specific car
export const getCarServiceHistory = async (req, res) => {
  try {
    const { carId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const records = await ServiceRecord.find({ plateNumber: carId })
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ serviceDate: -1 });

    const total = await ServiceRecord.countDocuments({ plateNumber: carId });

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get car service history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service history',
      error: error.message,
    });
  }
};

// Get pending payments (Unpaid and Partial)
export const getPendingPayments = async (req, res) => {
  try {
    const records = await ServiceRecord.find({ paymentStatus: { $in: ['Unpaid', 'Partial'] } })
      .populate('plateNumber', 'plateNumber')
      .populate('serviceCode', 'serviceName servicePrice')
      .sort({ serviceDate: -1 });

    const pendingAmount = records.reduce((total, record) => {
      const service = record.serviceCode;
      return total + (service.servicePrice - record.amountPaid);
    }, 0);

    res.status(200).json({
      success: true,
      count: records.length,
      pendingAmount,
      data: records,
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payments',
      error: error.message,
    });
  }
};
