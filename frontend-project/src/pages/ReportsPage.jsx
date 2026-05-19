import React, { useState, useEffect, useCallback } from 'react';
import { reportAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, downloadFile } from '../utils/helpers';
import { SkeletonLoader, EmptyState, Badge } from '../components/UI';
import { 
  FileText, Download, Loader, Calendar, Search, Filter,
  Printer, Mail, TrendingUp, DollarSign, Car, Wrench,
  FileSpreadsheet, FileJson, FilePieChart, Eye
} from 'lucide-react';

const ReportsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('service-bill');
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  const reportTabs = [
    { id: 'service-bill', label: 'Service Bill', icon: FileText, color: 'primary' },
    { id: 'daily-payment', label: 'Daily Payment', icon: DollarSign, color: 'success' },
    { id: 'monthly-revenue', label: 'Monthly Revenue', icon: TrendingUp, color: 'warning' },
    { id: 'mechanic-performance', label: 'Mechanic Performance', icon: Wrench, color: 'secondary' },
    { id: 'service-frequency', label: 'Service Frequency', icon: Car, color: 'info' },
  ];

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      let reportData = [];

      switch (activeTab) {
        case 'service-bill':
          response = await reportAPI.getServiceBill();
          reportData = response.data.data || [];
          break;
        case 'daily-payment':
          response = await reportAPI.getDailyPaymentReport(new Date().toISOString());
          reportData = response.data.data || [];
          break;
        case 'monthly-revenue':
          response = await reportAPI.getMonthlyRevenueReport();
          reportData = response.data.data || [];
          break;
        case 'mechanic-performance':
          response = await reportAPI.getMechanicPerformanceReport();
          reportData = response.data.data || [];
          break;
        case 'service-frequency':
          response = await reportAPI.getServiceFrequencyReport();
          reportData = response.data.data || [];
          break;
        default:
          reportData = [];
      }

      setData(reportData);
      
      const totalAmount = reportData.reduce((sum, item) => sum + (item.servicePrice || item.amountPaid || item.revenue || item.totalRevenue || 0), 0);
      const totalPaid = reportData.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
      
      setSummary({
        totalRecords: reportData.length,
        totalAmount: totalAmount,
        totalPaid: totalPaid,
        totalPending: totalAmount - totalPaid,
      });
    } catch (error) {
      addToast('Error fetching report', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, addToast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      let response;
      let filename;

      if (activeTab === 'service-bill') {
        if (format === 'pdf') {
          response = await reportAPI.exportServiceBillPDF();
          filename = `Service-Bill-${formatDate(new Date())}.pdf`;
        } else if (format === 'excel') {
          response = await reportAPI.exportServiceBillExcel();
          filename = `Service-Bill-${formatDate(new Date())}.xlsx`;
        } else if (format === 'csv') {
          response = await reportAPI.exportServiceBillCSV();
          filename = `Service-Bill-${formatDate(new Date())}.csv`;
        }
      } else if (activeTab === 'daily-payment') {
        response = await reportAPI.exportPaymentReportPDF();
        filename = `Daily-Payment-${formatDate(new Date())}.pdf`;
      }

      if (response && response.data) {
        downloadFile(response.data, filename);
        addToast('Report exported successfully', 'success');
      }
    } catch (error) {
      addToast('Error exporting report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  // Service Bill Table
  const renderServiceBill = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-3 py-2 text-xs font-semibold">Plate</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Service</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Date</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Price</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Paid</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Status</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Paid Date</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Mechanic</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((bill, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-3 py-2 text-sm">{bill.carPlate}</td>
              <td className="px-3 py-2 text-sm">{bill.serviceName}</td>
              <td className="px-3 py-2 text-sm">{formatDate(bill.serviceDate)}</td>
              <td className="px-3 py-2 text-sm text-right">{formatCurrency(bill.servicePrice)}</td>
              <td className="px-3 py-2 text-sm text-right text-green-600">{formatCurrency(bill.amountPaid)}</td>
              <td className="px-3 py-2 text-sm">
                <Badge type={bill.paymentStatus === 'Paid' ? 'success' : bill.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                  {bill.paymentStatus}
                </Badge>
              </td>
              <td className="px-3 py-2 text-sm">{formatDate(bill.paymentDate)}</td>
              <td className="px-3 py-2 text-sm">{bill.doneBy}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
          <tr>
            <td colSpan="3" className="px-3 py-2 text-sm font-semibold">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right">{formatCurrency(summary.totalAmount)}</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-green-600">{formatCurrency(summary.totalPaid)}</td>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // Daily Payment Table
  const renderDailyPayment = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-3 py-2 text-xs font-semibold">Plate</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Service</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Service Date</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Amount</th>
            <th className="text-left px-3 py-2 text-xs font-semibold">Received By</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((payment, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-3 py-2 text-sm">{payment.carPlate}</td>
              <td className="px-3 py-2 text-sm">{payment.serviceName}</td>
              <td className="px-3 py-2 text-sm">{formatDate(payment.serviceDate)}</td>
              <td className="px-3 py-2 text-sm text-right text-green-600">{formatCurrency(payment.amountPaid)}</td>
              <td className="px-3 py-2 text-sm">{payment.receivedBy}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
          <tr>
            <td colSpan="3" className="px-3 py-2 text-sm font-semibold">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-green-600">{formatCurrency(summary.totalAmount)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // Monthly Revenue Table
  const renderMonthlyRevenue = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-3 py-2 text-xs font-semibold">Date</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Revenue</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((day, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-3 py-2 text-sm">{day._id}</td>
              <td className="px-3 py-2 text-sm text-right text-green-600">{formatCurrency(day.revenue)}</td>
              <td className="px-3 py-2 text-sm text-right">{day.count}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
          <tr>
            <td className="px-3 py-2 text-sm font-semibold">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-green-600">{formatCurrency(summary.totalAmount)}</td>
            <td className="px-3 py-2 text-sm font-bold text-right">{summary.totalRecords}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // Mechanic Performance Table
  const renderMechanicPerformance = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-3 py-2 text-xs font-semibold">Mechanic</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Services</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((perf, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-3 py-2 text-sm font-medium">{perf._id}</td>
              <td className="px-3 py-2 text-sm text-right">{perf.servicesCount}</td>
              <td className="px-3 py-2 text-sm text-right text-green-600">{formatCurrency(perf.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
          <tr>
            <td className="px-3 py-2 text-sm font-semibold">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right">{summary.totalRecords}</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-green-600">{formatCurrency(summary.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // Service Frequency Table
  const renderServiceFrequency = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-3 py-2 text-xs font-semibold">Service</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Count</th>
            <th className="text-right px-3 py-2 text-xs font-semibold">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((freq, idx) => (
            <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="px-3 py-2 text-sm font-medium">{freq.serviceName}</td>
              <td className="px-3 py-2 text-sm text-right">{freq.count}</td>
              <td className="px-3 py-2 text-sm text-right text-green-600">{formatCurrency(freq.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
          <tr>
            <td className="px-3 py-2 text-sm font-semibold">Total</td>
            <td className="px-3 py-2 text-sm font-bold text-right">{summary.totalRecords}</td>
            <td className="px-3 py-2 text-sm font-bold text-right text-green-600">{formatCurrency(summary.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'service-bill': return renderServiceBill();
      case 'daily-payment': return renderDailyPayment();
      case 'monthly-revenue': return renderMonthlyRevenue();
      case 'mechanic-performance': return renderMechanicPerformance();
      case 'service-frequency': return renderServiceFrequency();
      default: return null;
    }
  };

  const activeReport = reportTabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Generate and export comprehensive business reports
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-outline flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          {(activeTab === 'service-bill' || activeTab === 'daily-payment') && (
            <>
              <button onClick={() => handleExport('pdf')} disabled={exporting} className="btn btn-primary flex items-center gap-2">
                {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                PDF
              </button>
              <button onClick={() => handleExport('excel')} disabled={exporting} className="btn btn-secondary flex items-center gap-2">
                {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Excel
              </button>
              <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-outline flex items-center gap-2">
                {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
                CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Total Records</p>
              <p className="text-2xl font-bold">{summary.totalRecords}</p>
            </div>
            <FilePieChart className="w-8 h-8 text-primary-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Amount Paid</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Pending Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</p>
            </div>
            <Eye className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 pb-2">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30 text-${tab.color}-600 dark:text-${tab.color}-400`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeReport?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-9 w-full text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="btn btn-outline flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              {dateRange.start} to {dateRange.end}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card">
        {loading ? (
          <SkeletonLoader count={5} type="table" />
        ) : data.length === 0 ? (
          <EmptyState 
            title="No data available" 
            description={`No records found for ${activeReport?.label} report`}
            icon={FileText}
          />
        ) : (
          renderContent()
        )}
      </div>

      {/* Export Options Card */}
      <div className="card bg-slate-50 dark:bg-slate-800/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Export Options</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download report in multiple formats</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleExport('pdf')} className="btn btn-primary flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Export as PDF
            </button>
            <button onClick={() => handleExport('excel')} className="btn btn-secondary flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              Export as Excel
            </button>
            <button onClick={() => handleExport('csv')} className="btn btn-outline flex items-center gap-2 text-sm">
              <FileJson className="w-4 h-4" />
              Export as CSV
            </button>
            <button className="btn btn-outline flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              Email Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
