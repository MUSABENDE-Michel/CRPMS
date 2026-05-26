import React, { useState, useEffect, useCallback } from 'react';
import { serviceRecordAPI, paymentAPI, carAPI, serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, getPaymentStatusColor, validateRequired, validateAmount } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination, Badge } from '../components/UI';
import InvoiceModal from '../components/InvoiceModal';
import { 
  Plus, Edit2, Trash2, Search, Eye, Calendar, DollarSign, 
  User, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle,
  Printer, Download, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

// Service Records Page
export const ServiceRecordsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [invoiceRecord, setInvoiceRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    plateNumber: '',
    serviceCode: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Unpaid',
    doneBy: '',
  });
  const [errors, setErrors] = useState({});

  // Get today's date for validation
  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsRes, carsRes, servicesRes] = await Promise.all([
        serviceRecordAPI.getServiceRecords(currentPage, 10, search),
        carAPI.getCars(1, 100),
        serviceAPI.getActiveServices(),
      ]);
      setRecords(recordsRes.data.data || []);
      setCars(carsRes.data.data || []);
      setServices(servicesRes.data.data || []);
      setTotalPages(recordsRes.data.pagination?.pages || 1);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({
        serviceDate: new Date(record.serviceDate).toISOString().split('T')[0],
        plateNumber: record.plateNumber?._id || '',
        serviceCode: record.serviceCode?._id || '',
        amountPaid: record.amountPaid.toString(),
        paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
        paymentStatus: record.paymentStatus,
        doneBy: record.doneBy,
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceDate: today,
        plateNumber: '',
        serviceCode: '',
        amountPaid: '',
        paymentDate: today,
        paymentStatus: 'Unpaid',
        doneBy: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      serviceDate: today,
      plateNumber: '',
      serviceCode: '',
      amountPaid: '',
      paymentDate: today,
      paymentStatus: 'Unpaid',
      doneBy: '',
    });
    setErrors({});
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setViewDetails(true);
  };

  const handlePrintInvoice = (record) => {
    setInvoiceRecord(record);
    setShowInvoice(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.plateNumber)) {
      newErrors.plateNumber = 'Please select a car';
    }
    
    if (!validateRequired(formData.serviceCode)) {
      newErrors.serviceCode = 'Please select a service';
    }
    
    if (!validateRequired(formData.amountPaid)) {
      newErrors.amountPaid = 'Amount paid is required';
    } else if (!validateAmount(formData.amountPaid, 10000000)) {
      newErrors.amountPaid = 'Amount must be positive and less than 10,000,000 RWF';
    }
    
    if (!validateRequired(formData.doneBy)) {
      newErrors.doneBy = 'Mechanic name is required';
    } else if (formData.doneBy.length < 3) {
      newErrors.doneBy = 'Mechanic name must be at least 3 characters';
    }
    
    if (!validateRequired(formData.serviceDate)) {
      newErrors.serviceDate = 'Service date is required';
    } else if (formData.serviceDate > today) {
      newErrors.serviceDate = 'Service date cannot be in the future';
    }
    
    if (!validateRequired(formData.paymentDate)) {
      newErrors.paymentDate = 'Payment date is required';
    } else if (formData.paymentDate > today) {
      newErrors.paymentDate = 'Payment date cannot be in the future';
    } else if (formData.paymentDate < formData.serviceDate) {
      newErrors.paymentDate = 'Payment date cannot be before service date';
    }
    
    // Validate amount against service price
    const selectedService = services.find(s => s._id === formData.serviceCode);
    if (selectedService && parseFloat(formData.amountPaid) > selectedService.servicePrice) {
      newErrors.amountPaid = `Amount cannot exceed service price of ${formatCurrency(selectedService.servicePrice)}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        amountPaid: parseFloat(formData.amountPaid),
      };

      if (editingId) {
        await serviceRecordAPI.updateServiceRecord(editingId, data);
        addToast('Service record updated successfully', 'success');
      } else {
        await serviceRecordAPI.createServiceRecord(data);
        addToast('Service record created successfully', 'success');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving record';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await serviceRecordAPI.deleteServiceRecord(selectedRecord._id);
      addToast('Service record deleted successfully', 'success');
      setDeleteConfirm(false);
      setSelectedRecord(null);
      fetchData();
    } catch (error) {
      addToast('Error deleting record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Get selected service price
  const selectedService = services.find(s => s._id === formData.serviceCode);
  const maxAmount = selectedService?.servicePrice || 0;

  // Calculate summary statistics
  const totalRecords = records.length;
  const totalRevenue = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingAmount = records.reduce((sum, r) => sum + ((r.serviceCode?.servicePrice || 0) - r.amountPaid), 0);
  const paidRecords = records.filter(r => r.paymentStatus === 'Paid').length;
  const partialRecords = records.filter(r => r.paymentStatus === 'Partial').length;
  const unpaidRecords = records.filter(r => r.paymentStatus === 'Unpaid').length;

  if (loading && records.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Records</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track all vehicle service history, payments, and mechanic assignments
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 transition-all duration-300 shadow-lg btn btn-primary hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Record New Service
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="text-white transition-transform duration-300 transform card bg-gradient-to-r from-primary-500 to-primary-600 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Total Records</p>
              <p className="text-3xl font-bold">{totalRecords}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="text-white transition-transform duration-300 transform card bg-gradient-to-r from-green-500 to-green-600 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="text-white transition-transform duration-300 transform card bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-100">Pending Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="text-white transition-transform duration-300 transform card bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Active Mechanics</p>
              <p className="text-3xl font-bold">{new Set(records.map(r => r.doneBy)).size}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <User className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between border-l-4 card border-l-green-500">
          <div>
            <p className="text-sm text-slate-500">Paid</p>
            <p className="text-2xl font-bold text-green-600">{paidRecords}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="flex items-center justify-between border-l-4 card border-l-yellow-500">
          <div>
            <p className="text-sm text-slate-500">Partial</p>
            <p className="text-2xl font-bold text-yellow-600">{partialRecords}</p>
          </div>
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="flex items-center justify-between border-l-4 card border-l-red-500">
          <div>
            <p className="text-sm text-slate-500">Unpaid</p>
            <p className="text-2xl font-bold text-red-600">{unpaidRecords}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by car plate number or mechanic name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 form-input"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 btn btn-outline">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 btn btn-outline">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 btn btn-outline">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Service Records Table */}
      <div className="overflow-x-auto card">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Service History</h2>
          <Badge type="primary">{totalRecords} records found</Badge>
        </div>

        {records.length === 0 ? (
          <EmptyState
            title="No service records found"
            description="Start by recording your first service"
            icon={Calendar}
            action={
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Record First Service
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">Car Plate</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">Service</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">Service Date</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-600 dark:text-slate-300">Amount Paid</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center uppercase text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600 dark:text-slate-300">Mechanic</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center uppercase text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr 
                  key={record._id} 
                  className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group ${
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {record.plateNumber?.plateNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {record.serviceCode?.serviceName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(record.serviceDate)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-green-600 dark:text-green-400">
                    {formatCurrency(record.amountPaid)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        record.paymentStatus === 'Paid' ? 'bg-green-500' :
                        record.paymentStatus === 'Partial' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      {record.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{record.doneBy}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(record)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Print Invoice / Facture"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(record)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setDeleteConfirm(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 btn btn-outline btn-sm disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 btn btn-outline btn-sm disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal with Date Validation */}
      <Modal
        isOpen={showModal}
        title={editingId ? '✏️ Edit Service Record' : '📝 Record New Service'}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? 'Update Record' : 'Save Record'}
        cancelText="Cancel"
        size="md"
        isLoading={loading}
      >
        <div className="space-y-5">
          {/* Warning Banner */}
          <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <p className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4" />
              <span>⚠️ Important: Service date and payment date cannot be in the future. Payment date cannot be before service date.</span>
            </p>
          </div>

          <FormGroup label="Select Car" error={errors.plateNumber} required>
            <select
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">-- Choose a vehicle --</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.plateNumber} - {car.model} ({car.type}) | Mechanic: {car.mechanicName}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Select Service" error={errors.serviceCode} required>
            <select
              name="serviceCode"
              value={formData.serviceCode}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">-- Choose a service --</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceName} - {formatCurrency(service.servicePrice)}
                </option>
              ))}
            </select>
          </FormGroup>

          {selectedService && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Service Price:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedService.servicePrice)}
                </span>
              </div>
            </div>
          )}

          <FormGroup label="Service Date" error={errors.serviceDate} required>
            <Input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              max={today}
              required
            />
            <p className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Cannot select future dates
            </p>
          </FormGroup>

          <FormGroup label="Amount Paid (RWF)" error={errors.amountPaid} required>
            <Input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              step="1000"
              min="0"
              max={maxAmount || 10000000}
              placeholder="Enter amount paid"
              error={!!errors.amountPaid}
            />
            {maxAmount > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Maximum allowed: {formatCurrency(maxAmount)}
              </p>
            )}
          </FormGroup>

          <FormGroup label="Payment Date" error={errors.paymentDate} required>
            <Input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              max={today}
              min={formData.serviceDate}
              required
            />
            <p className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <AlertCircle className="w-3 h-3" />
              Cannot be in the future or before service date
            </p>
          </FormGroup>

          <FormGroup label="Payment Status" required>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Unpaid">💰 Unpaid - No payment received</option>
              <option value="Partial">🟡 Partial - Partially paid</option>
              <option value="Paid">✅ Paid - Fully paid</option>
            </select>
          </FormGroup>

          <FormGroup label="Mechanic Name" error={errors.doneBy} required>
            <Input
              type="text"
              name="doneBy"
              value={formData.doneBy}
              onChange={handleChange}
              placeholder="Enter mechanic's full name"
              error={!!errors.doneBy}
            />
          </FormGroup>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails}
        title="🔍 Service Record Details"
        onClose={() => setViewDetails(false)}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Car Information */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary-600">
                  🚗 Vehicle Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Plate Number:</span>
                    <span className="font-mono text-sm font-semibold">{selectedRecord.plateNumber?.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Car Model:</span>
                    <span className="text-sm">{selectedRecord.plateNumber?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Car Type:</span>
                    <span className="text-sm">{selectedRecord.plateNumber?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Year:</span>
                    <span className="text-sm">{selectedRecord.plateNumber?.manufacturingYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Driver Phone:</span>
                    <span className="text-sm">{selectedRecord.plateNumber?.driverPhone}</span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary-600">
                  🔧 Service Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Service Name:</span>
                    <span className="text-sm font-semibold">{selectedRecord.serviceCode?.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Service Code:</span>
                    <span className="font-mono text-sm">{selectedRecord.serviceCode?.serviceCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Service Date:</span>
                    <span className="text-sm">{formatDate(selectedRecord.serviceDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Mechanic:</span>
                    <span className="text-sm font-medium">{selectedRecord.doneBy}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="col-span-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary-600">
                  💰 Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Service Price:</span>
                    <span className="text-sm font-semibold">{formatCurrency(selectedRecord.serviceCode?.servicePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Amount Paid:</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(selectedRecord.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Remaining Balance:</span>
                    <span className="text-sm font-bold text-amber-600">
                      {formatCurrency((selectedRecord.serviceCode?.servicePrice || 0) - selectedRecord.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Payment Date:</span>
                    <span className="text-sm">{formatDate(selectedRecord.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Payment Status:</span>
                    <Badge type={
                      selectedRecord.paymentStatus === 'Paid' ? 'success' :
                      selectedRecord.paymentStatus === 'Partial' ? 'warning' : 'danger'
                    }>
                      {selectedRecord.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        record={invoiceRecord}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Service Record"
        message="Are you sure you want to delete this service record? This action cannot be undone and may affect payment records."
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedRecord(null);
        }}
        isDanger
        isLoading={loading}
      />
    </div>
  );
};

// Payments Page Component
export const PaymentsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, revenueRes] = await Promise.all([
        paymentAPI.getPayments(currentPage, 10, search),
        paymentAPI.getDailyRevenue(),
      ]);
      setPayments(paymentsRes.data.data || []);
      setTotalPages(paymentsRes.data.pagination?.pages || 1);
      setDailyRevenue(revenueRes.data.totalRevenue || 0);
    } catch (error) {
      addToast('Error fetching payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (loading && payments.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track all payment transactions and revenue
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="text-white card bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Today's Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(dailyRevenue)}</p>
              <p className="mt-1 text-xs text-green-200">{today}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-blue-500 to-cyan-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Payments</p>
              <p className="text-3xl font-bold">{payments.length}</p>
              <p className="mt-1 text-xs text-blue-200">All time</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute w-5 h-5 left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments by received by or car plate..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 form-input"
          />
        </div>
      </div>

      <div className="overflow-x-auto card">
        {payments.length === 0 ? (
          <EmptyState title="No payments recorded" description="Payment history will appear here" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-sm font-semibold text-left">Car Plate</th>
                <th className="px-4 py-3 text-sm font-semibold text-left">Service</th>
                <th className="px-4 py-3 text-sm font-semibold text-right">Amount</th>
                <th className="px-4 py-3 text-sm font-semibold text-left">Payment Date</th>
                <th className="px-4 py-3 text-sm font-semibold text-left">Received By</th>
                <th className="px-4 py-3 text-sm font-semibold text-left">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 text-sm font-medium">{payment.serviceRecordId?.plateNumber?.plateNumber || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{payment.serviceRecordId?.serviceCode?.serviceName || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-green-600">{formatCurrency(payment.amountPaid)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm">{payment.receivedBy}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge type="primary">{payment.paymentMethod || 'Cash'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
};