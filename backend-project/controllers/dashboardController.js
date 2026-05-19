import Car from '../models/Car.js';
import Service from '../models/Service.js';
import ServiceRecord from '../models/ServiceRecord.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';

// Get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Cars serviced today
    const carsServicedToday = await ServiceRecord.find({
      serviceDate: { $gte: today, $lt: tomorrow },
    }).distinct('plateNumber');

    // Pending payments
    const pendingPayments = await ServiceRecord.find({
      paymentStatus: { $in: ['Unpaid', 'Partial'] },
    }).populate('serviceCode');

    let pendingAmount = 0;
    pendingPayments.forEach(record => {
      pendingAmount += record.serviceCode.servicePrice - record.amountPaid;
    });

    // Daily revenue
    const dailyPayments = await Payment.find({
      paymentDate: { $gte: today, $lt: tomorrow },
    });

    const dailyRevenue = dailyPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);

    // Total counts
    const totalCars = await Car.countDocuments({ status: 'Active' });
    const totalServices = await Service.countDocuments({ status: 'Active' });

    // Recent activities
    const recentActivities = await ActivityLog.find()
      .populate('adminId', 'username')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        carsServicedToday: carsServicedToday.length,
        pendingPaymentsCount: pendingPayments.length,
        pendingAmount,
        dailyRevenue,
        totalCars,
        totalServices,
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};

// Get payment status chart data
export const getPaymentStatusData = async (req, res) => {
  try {
    const paymentStatuses = await ServiceRecord.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const data = {
      Paid: 0,
      Partial: 0,
      Unpaid: 0,
    };

    paymentStatuses.forEach(status => {
      data[status._id] = status.count;
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status data',
      error: error.message,
    });
  }
};

// Get monthly revenue chart data
export const getMonthlyRevenueData = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const revenues = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear, 12, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          revenue: { $sum: '$amountPaid' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = monthNames.map((month, index) => {
      const monthRevenue = revenues.find(r => r._id === index + 1);
      return {
        month,
        revenue: monthRevenue?.revenue || 0,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue data',
      error: error.message,
    });
  }
};

// Get service category chart data
export const getServiceCategoryData = async (req, res) => {
  try {
    const categories = await ServiceRecord.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceCode',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $unwind: '$service',
      },
      {
        $group: {
          _id: '$service.serviceName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const data = categories.map(cat => ({
      name: cat._id,
      value: cat.count,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service category data',
      error: error.message,
    });
  }
};

// Get activity log
export const getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 20, action = '', entity = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const logs = await ActivityLog.find(filter)
      .populate('adminId', 'username')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs,
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
      message: 'Error fetching activity log',
      error: error.message,
    });
  }
};
