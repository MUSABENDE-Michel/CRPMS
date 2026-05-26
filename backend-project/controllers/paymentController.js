import Payment from '../models/Payment.js';
import ServiceRecord from '../models/ServiceRecord.js';
import Car from '../models/Car.js';
import Service from '../models/Service.js';
import { logActivity } from '../utils/activityLogger.js';

// Get all payments with pagination
export const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { receivedBy: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'serviceRecordId',
        populate: [
          { path: 'plateNumber', model: 'Car' },
          { path: 'serviceCode', model: 'Service' }
        ]
      })
      .populate('createdBy', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 });

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message,
    });
  }
};

// Get single payment
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'serviceRecordId',
        populate: [
          { path: 'plateNumber', model: 'Car' },
          { path: 'serviceCode', model: 'Service' }
        ]
      })
      .populate('createdBy', 'username');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message,
    });
  }
};

// Record payment
export const recordPayment = async (req, res) => {
  try {
    const { serviceRecordId, paymentDate, amountPaid, receivedBy, paymentMethod } = req.body;

    // Validation
    if (!serviceRecordId || !paymentDate || !amountPaid || !receivedBy) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate amount is positive
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Validate payment date
    const paymentDateObj = new Date(paymentDate);
    if (isNaN(paymentDateObj)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Validate service record exists
    const serviceRecord = await ServiceRecord.findById(serviceRecordId).populate('serviceCode');
    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found',
      });
    }

    const service = serviceRecord.serviceCode;
    const totalAmount = service.servicePrice;
    const currentPaid = serviceRecord.amountPaid || 0;
    const remainingBalance = totalAmount - currentPaid;

    // Validate amount doesn't exceed remaining balance
    if (amount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Amount cannot exceed remaining balance of ${remainingBalance} RWF. Please enter a smaller amount.`,
      });
    }

    // Create payment
    const payment = await Payment.create({
      serviceRecordId,
      paymentDate: paymentDateObj,
      amountPaid: amount,
      receivedBy,
      paymentMethod: paymentMethod || 'Cash',
      createdBy: req.session.adminId,
    });

    // Update service record
    const newTotalPaid = currentPaid + amount;
    let newPaymentStatus = 'Unpaid';

    if (newTotalPaid >= totalAmount) {
      newPaymentStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newPaymentStatus = 'Partial';
    }

    serviceRecord.amountPaid = newTotalPaid;
    serviceRecord.paymentStatus = newPaymentStatus;
    serviceRecord.paymentDate = paymentDateObj;
    await serviceRecord.save();

    await logActivity(req.session.adminId, 'CREATE', 'Payment', payment._id, `Payment recorded: ${amount} RWF`);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message,
    });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, amountPaid, receivedBy, paymentMethod } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Get service record
    const serviceRecord = await ServiceRecord.findById(payment.serviceRecordId).populate('serviceCode');
    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found',
      });
    }
    
    const service = serviceRecord.serviceCode;
    const totalAmount = service.servicePrice;

    // Get all other payments
    const otherPayments = await Payment.find({ 
      serviceRecordId: payment.serviceRecordId, 
      _id: { $ne: payment._id } 
    });
    const otherPaymentsTotal = otherPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    // Calculate new amount
    let newAmount = payment.amountPaid;
    if (amountPaid !== undefined) {
      newAmount = parseFloat(amountPaid);
      if (isNaN(newAmount) || newAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive',
        });
      }
      
      const newTotal = otherPaymentsTotal + newAmount;
      if (newTotal > totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Total payments cannot exceed service price (${totalAmount} RWF)`,
        });
      }
    }

    // Update fields
    if (paymentDate) payment.paymentDate = new Date(paymentDate);
    if (amountPaid !== undefined) payment.amountPaid = newAmount;
    if (receivedBy) payment.receivedBy = receivedBy;
    if (paymentMethod) payment.paymentMethod = paymentMethod;

    await payment.save();

    // Recalculate service record status
    const allPayments = await Payment.find({ serviceRecordId: payment.serviceRecordId });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    let newPaymentStatus = 'Unpaid';
    if (totalPaid >= totalAmount) {
      newPaymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      newPaymentStatus = 'Partial';
    }

    serviceRecord.amountPaid = totalPaid;
    serviceRecord.paymentStatus = newPaymentStatus;
    await serviceRecord.save();

    await logActivity(req.session.adminId, 'UPDATE', 'Payment', payment._id, 'Payment updated');

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message,
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const serviceRecordId = payment.serviceRecordId;

    await Payment.findByIdAndDelete(id);

    // Recalculate service record status
    const serviceRecord = await ServiceRecord.findById(serviceRecordId).populate('serviceCode');
    if (serviceRecord) {
      const payments = await Payment.find({ serviceRecordId });
      const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
      const totalAmount = serviceRecord.serviceCode.servicePrice;

      let newPaymentStatus = 'Unpaid';
      if (totalPaid >= totalAmount) {
        newPaymentStatus = 'Paid';
      } else if (totalPaid > 0) {
        newPaymentStatus = 'Partial';
      }

      serviceRecord.amountPaid = totalPaid;
      serviceRecord.paymentStatus = newPaymentStatus;
      await serviceRecord.save();
    }

    await logActivity(req.session.adminId, 'DELETE', 'Payment', id, 'Payment deleted');

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message,
    });
  }
};

// Get daily revenue
export const getDailyRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const payments = await Payment.find({
      paymentDate: { $gte: today, $lt: tomorrow },
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

    res.status(200).json({
      success: true,
      totalRevenue,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('Daily revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily revenue',
      error: error.message,
    });
  }
};

// Get monthly revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const { month, year } = req.query;
    const selectedMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 1);

    const payments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          revenue: { $sum: '$amountPaid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = payments.reduce((sum, day) => sum + day.revenue, 0);

    res.status(200).json({
      success: true,
      totalRevenue,
      data: payments,
    });
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue',
      error: error.message,
    });
  }
};
