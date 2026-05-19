import ServiceRecord from '../models/ServiceRecord.js';
import Payment from '../models/Payment.js';
import Car from '../models/Car.js';
import Service from '../models/Service.js';
import { generateServiceBillPDF, generatePaymentReportPDF, generateExcelReport, generateCSVReport } from '../utils/reportGenerator.js';

// Get service bill data
export const getServiceBill = async (req, res) => {
  try {
    const records = await ServiceRecord.find()
      .populate('plateNumber', 'plateNumber type model')
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username')
      .sort({ serviceDate: -1 });

    const billData = records.map(record => ({
      carPlate: record.plateNumber.plateNumber,
      serviceName: record.serviceCode.serviceName,
      serviceDate: record.serviceDate,
      servicePrice: record.serviceCode.servicePrice,
      amountPaid: record.amountPaid,
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate,
      doneBy: record.doneBy,
      createdBy: record.createdBy.username,
    }));

    res.status(200).json({
      success: true,
      data: billData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service bill',
      error: error.message,
    });
  }
};

// Get daily payment report
export const getDailyPaymentReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = new Date(date || new Date());
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await Payment.find({
      paymentDate: { $gte: reportDate, $lt: nextDay },
    }).populate('serviceRecordId');

    const reportData = await Promise.all(
      payments.map(async payment => {
        const serviceRecord = payment.serviceRecordId;
        const car = await Car.findById(serviceRecord.plateNumber);
        const service = await Service.findById(serviceRecord.serviceCode);

        return {
          carPlate: car.plateNumber,
          serviceName: service.serviceName,
          serviceDate: serviceRecord.serviceDate,
          amountPaid: payment.amountPaid,
          receivedBy: payment.receivedBy,
          createdBy: payment.createdBy.username,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily payment report',
      error: error.message,
    });
  }
};

// Get monthly revenue report
export const getMonthlyRevenueReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const revenues = await Payment.aggregate([
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

    res.status(200).json({
      success: true,
      data: revenues,
      totalRevenue: revenues.reduce((sum, day) => sum + day.revenue, 0),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue report',
      error: error.message,
    });
  }
};

// Get mechanic performance report
export const getMechanicPerformanceReport = async (req, res) => {
  try {
    const performance = await ServiceRecord.aggregate([
      {
        $group: {
          _id: '$doneBy',
          servicesCount: { $sum: 1 },
          totalRevenue: { $sum: '$amountPaid' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mechanic performance report',
      error: error.message,
    });
  }
};

// Get service frequency report
export const getServiceFrequencyReport = async (req, res) => {
  try {
    const frequency = await ServiceRecord.aggregate([
      {
        $group: {
          _id: '$serviceCode',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amountPaid' },
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      {
        $unwind: '$serviceDetails',
      },
      {
        $project: {
          serviceName: '$serviceDetails.serviceName',
          count: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: frequency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service frequency report',
      error: error.message,
    });
  }
};

// Export service bill as PDF
export const exportServiceBillPDF = async (req, res) => {
  try {
    const records = await ServiceRecord.find()
      .populate('plateNumber', 'plateNumber')
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username')
      .sort({ serviceDate: -1 });

    const billData = records.map(record => ({
      carPlate: record.plateNumber.plateNumber,
      serviceName: record.serviceCode.serviceName,
      serviceDate: record.serviceDate,
      servicePrice: record.serviceCode.servicePrice,
      amountPaid: record.amountPaid,
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate,
      doneBy: record.doneBy,
      createdBy: record.createdBy.username,
    }));

    const filename = `ServiceBill_${Date.now()}.pdf`;
    await generateServiceBillPDF(billData, filename);

    res.download(`temp/${filename}`, filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};

// Export daily payment report as PDF
export const exportPaymentReportPDF = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = new Date(date || new Date());
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await Payment.find({
      paymentDate: { $gte: reportDate, $lt: nextDay },
    }).populate('serviceRecordId');

    const reportData = await Promise.all(
      payments.map(async payment => {
        const serviceRecord = payment.serviceRecordId;
        const car = await Car.findById(serviceRecord.plateNumber);
        const service = await Service.findById(serviceRecord.serviceCode);

        return {
          carPlate: car.plateNumber,
          serviceName: service.serviceName,
          serviceDate: serviceRecord.serviceDate,
          amountPaid: payment.amountPaid,
          receivedBy: payment.receivedBy,
        };
      })
    );

    const filename = `PaymentReport_${Date.now()}.pdf`;
    await generatePaymentReportPDF(reportData, filename);

    res.download(`temp/${filename}`, filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};

// Export service bill as Excel
export const exportServiceBillExcel = async (req, res) => {
  try {
    const records = await ServiceRecord.find()
      .populate('plateNumber', 'plateNumber')
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username');

    const billData = records.map(record => ({
      carPlate: record.plateNumber.plateNumber,
      serviceName: record.serviceCode.serviceName,
      serviceDate: new Date(record.serviceDate).toLocaleDateString(),
      servicePrice: record.serviceCode.servicePrice,
      amountPaid: record.amountPaid,
      paymentStatus: record.paymentStatus,
      paymentDate: new Date(record.paymentDate).toLocaleDateString(),
      doneBy: record.doneBy,
    }));

    const filename = `ServiceBill_${Date.now()}.xlsx`;
    const columns = {
      carPlate: 'carPlate',
      serviceName: 'serviceName',
      serviceDate: 'serviceDate',
      servicePrice: 'servicePrice',
      amountPaid: 'amountPaid',
      paymentStatus: 'paymentStatus',
      paymentDate: 'paymentDate',
      doneBy: 'doneBy',
    };

    await generateExcelReport(billData, filename, columns);

    res.download(`temp/${filename}`, filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating Excel',
      error: error.message,
    });
  }
};

// Export service bill as CSV
export const exportServiceBillCSV = async (req, res) => {
  try {
    const records = await ServiceRecord.find()
      .populate('plateNumber', 'plateNumber')
      .populate('serviceCode', 'serviceName servicePrice')
      .populate('createdBy', 'username');

    const billData = records.map(record => ({
      carPlate: record.plateNumber.plateNumber,
      serviceName: record.serviceCode.serviceName,
      serviceDate: new Date(record.serviceDate).toLocaleDateString(),
      servicePrice: record.serviceCode.servicePrice,
      amountPaid: record.amountPaid,
      paymentStatus: record.paymentStatus,
      paymentDate: new Date(record.paymentDate).toLocaleDateString(),
      doneBy: record.doneBy,
    }));

    const filename = `ServiceBill_${Date.now()}.csv`;
    const columns = {
      carPlate: 'carPlate',
      serviceName: 'serviceName',
      serviceDate: 'serviceDate',
      servicePrice: 'servicePrice',
      amountPaid: 'amountPaid',
      paymentStatus: 'paymentStatus',
      paymentDate: 'paymentDate',
      doneBy: 'doneBy',
    };

    await generateCSVReport(billData, filename, columns);

    res.download(`temp/${filename}`, filename, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating CSV',
      error: error.message,
    });
  }
};
