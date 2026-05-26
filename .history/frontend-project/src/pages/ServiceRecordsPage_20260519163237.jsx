import React, { useState, useEffect, useCallback } from 'react';
import { serviceRecordAPI, paymentAPI, carAPI, serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, getPaymentStatusColor, validateRequired, validateAmount } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination } from '../components/UI';
import { Plus, Edit2, Trash2, Search, Eye, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';

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
  const [selectedRecord, setSelectedRecord] = useState(null);
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
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.plateNumber)) {
      newErrors.plateNumber = 'Car is required';
    }
    
    if (!validateRequired(formData.serviceCode)) {
      newErrors.serviceCode = 'Service is required';
    }
    
    if (!validateRequired(formData.amountPaid)) {
      newErrors.amountPaid = 'Amount is required';
    } else if (!validateAmount(formData.amountPaid, 10000000)) {
      newErrors.amountPaid = 'Amount must be positive (max 10,000,000 RWF)';
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
        addToast('Record updated successfully', 'success');
      } else {
        await serviceRecordAPI.createServiceRecord(data);
        addToast('Record created successfully', 'success');
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
      addToast('Record deleted successfully', 'success');
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

  // Calculate summary
  const totalRecords = records.length;
  const totalRevenue = records.reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingAmount = records.reduce((sum, r) => sum + ((r.serviceCode?.servicePrice || 0) - r.amountPaid), 0);

  if (loading && records.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Records</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track all vehicle service history and payments
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 shadow-lg btn btn-primary">
          <Plus className="w-5 h-5" />
          Record New Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="text-white card bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-100">Pending Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Active Mechanics</p>
              <p className="text-2xl font-bold">{new Set(records.map(r => r.doneBy)).size}</p>
            </div>
            <User className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute w-5 h-5 left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by car plate or mechanic..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 form-input"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto card">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Service History</h2>
          <span className="text-sm text-slate-500">{totalRecords} records found</span>
        </div>

        {records.length === 0 ? (
          <EmptyState
            title="No service records"
            description="Record your first service to get started"
            action={<button onClick={() => handleOpenModal()} className="btn btn-primary">Record Service</button>}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-xs font-semibold text-left">Car Plate</th>
                <th className="px-4 py-3 text-xs font-semibold text-left">Service</th>
                <th className="px-4 py-3 text-xs font-semibold text-left">Service Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-right">Amount Paid</th>
                <th className="px-4 py-3 text-xs font-semibold text-center">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-left">Mechanic</th>
                <th className="px-4 py-3 text-xs font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="transition-colors border-b hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {record.plateNumber?.plateNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {record.serviceCode?.serviceName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(record.serviceDate)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-green-600 dark:text-green-400">
                    {formatCurrency(record.amountPaid)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {record.doneBy}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(record)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setDeleteConfirm(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Add/Edit Modal with Date Validation */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Service Record' : 'Record New Service'}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? 'Update Record' : 'Save Record'}
        cancelText="Cancel"
        size="md"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              ⚠️ Service date and payment date cannot be in the future. Payment date cannot be before service date.
            </p>
          </div>

          <FormGroup label="Car" error={errors.plateNumber} required>
            <select
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a car</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.plateNumber} - {car.model} ({car.type})
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Service" error={errors.serviceCode} required>
            <select
              name="serviceCode"
              value={formData.serviceCode}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceName} ({formatCurrency(service.servicePrice)})
                </option>
              ))}
            </select>
          </FormGroup>

          {selectedService && (
            <div className="p-3 text-sm rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400">Service Price: <span className="font-semibold text-green-600">{formatCurrency(selectedService.servicePrice)}</span></p>
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
            <p className="mt-1 text-xs text-slate-500">Cannot select future dates</p>
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
              <p className="mt-1 text-xs text-slate-500">Maximum amount: {formatCurrency(maxAmount)}</p>
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
            <p className="mt-1 text-xs text-slate-500">Cannot be in the future or before service date</p>
          </FormGroup>

          <FormGroup label="Payment Status" required>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </FormGroup>

          <FormGroup label="Done By (Mechanic)" error={errors.doneBy} required>
            <Input
              type="text"
              name="doneBy"
              value={formData.doneBy}
              onChange={handleChange}
              placeholder="Mechanic full name"
              error={!!errors.doneBy}
            />
          </FormGroup>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails}
        title="Service Record Details"
        onClose={() => setViewDetails(false)}
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">Car Plate</label>
                <p className="font-medium text-slate-900 dark:text-white">{selectedRecord.plateNumber?.plateNumber}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Car Model</label>
                <p className="font-medium text-slate-900 dark:text-white">{selectedRecord.plateNumber?.model}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Service Name</label>
                <p className="font-medium text-slate-900 dark:text-white">{selectedRecord.serviceCode?.serviceName}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Service Price</label>
                <p className="font-medium text-green-600">{formatCurrency(selectedRecord.serviceCode?.servicePrice)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Service Date</label>
                <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedRecord.serviceDate)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Payment Date</label>
                <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedRecord.paymentDate)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Amount Paid</label>
                <p className="text-lg font-bold text-green-600">{formatCurrency(selectedRecord.amountPaid)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Payment Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedRecord.paymentStatus)}`}>
                  {selectedRecord.paymentStatus}
                </span>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Mechanic</label>
                <p className="font-medium text-slate-900 dark:text-white">{selectedRecord.doneBy}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Service Record"
        message="Are you sure you want to delete this service record? This action cannot be undone."
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

// Payments Page - Keep from previous response
export const PaymentsPage = () => {
  // ... (keep the PaymentsPage code from previous response)
  // Make sure to add date validation similar to above
};