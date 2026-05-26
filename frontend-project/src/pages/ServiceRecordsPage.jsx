import React, { useState, useEffect, useCallback } from 'react';
import { serviceRecordAPI, carAPI, serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, getPaymentStatusColor, validateRequired } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination, Badge } from '../components/UI';
import InvoiceModal from '../components/InvoiceModal';
import { 
  Plus, Edit2, Trash2, Search, Eye, Calendar, DollarSign, 
  User, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle,
  Printer, Filter, ChevronLeft, ChevronRight, CreditCard
} from 'lucide-react';

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
    paymentDate: new Date().toISOString().split('T')[0],
    doneBy: '',
  });
  const [errors, setErrors] = useState({});

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
        paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
        doneBy: record.doneBy,
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceDate: today,
        plateNumber: '',
        serviceCode: '',
        paymentDate: today,
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
      paymentDate: today,
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
      const data = { ...formData };

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

  const selectedService = services.find(s => s._id === formData.serviceCode);
  const totalRecords = records.length;
  const totalRevenue = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
  const pendingAmount = records.reduce((sum, r) => sum + ((r.serviceCode?.servicePrice || 0) - (r.amountPaid || 0)), 0);
  const paidRecords = records.filter(r => r.paymentStatus === 'Paid').length;
  const partialRecords = records.filter(r => r.paymentStatus === 'Partial').length;
  const unpaidRecords = records.filter(r => r.paymentStatus === 'Unpaid').length;

  if (loading && records.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Records</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record services performed on vehicles (payments are recorded separately)
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" />
          Record New Service
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-primary-100 text-sm">Total Records</p><p className="text-3xl font-bold">{totalRecords}</p></div>
            <Calendar className="w-8 h-8 text-primary-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-green-100 text-sm">Total Collected</p><p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p></div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-amber-100 text-sm">Pending Collection</p><p className="text-3xl font-bold">{formatCurrency(pendingAmount)}</p></div>
            <AlertCircle className="w-8 h-8 text-amber-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-purple-100 text-sm">Mechanics</p><p className="text-3xl font-bold">{new Set(records.map(r => r.doneBy)).size}</p></div>
            <User className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center justify-between border-l-4 border-l-green-500">
          <div><p className="text-sm text-slate-500">Paid</p><p className="text-2xl font-bold text-green-600">{paidRecords}</p></div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="card flex items-center justify-between border-l-4 border-l-yellow-500">
          <div><p className="text-sm text-slate-500">Partial</p><p className="text-2xl font-bold text-yellow-600">{partialRecords}</p></div>
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="card flex items-center justify-between border-l-4 border-l-red-500">
          <div><p className="text-sm text-slate-500">Unpaid</p><p className="text-2xl font-bold text-red-600">{unpaidRecords}</p></div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search by car plate or mechanic..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="form-input pl-10 w-full" />
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h2 className="text-lg font-semibold">Service History</h2>
          <Badge type="primary">{totalRecords} records</Badge>
        </div>

        {records.length === 0 ? (
          <EmptyState title="No service records" description="Record your first service" action={<button onClick={() => handleOpenModal()} className="btn btn-primary">Record Service</button>} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold">Car Plate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Service Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">Pending</th>
                <th className="text-center px-4 py-3 text-xs font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Mechanic</th>
                <th className="text-center px-4 py-3 text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const price = record.serviceCode?.servicePrice || 0;
                const paid = record.amountPaid || 0;
                const pending = price - paid;
                return (
                  <tr key={record._id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-primary-600">{record.plateNumber?.plateNumber}</td>
                    <td className="px-4 py-3 text-sm">{record.serviceCode?.serviceName}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(record.serviceDate)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(price)}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(paid)}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(pending)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.doneBy}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewDetails(record)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="View details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handlePrintInvoice(record)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="Print Invoice"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedRecord(record); setDeleteConfirm(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn btn-outline btn-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn btn-outline btn-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal - NO PAYMENT FIELD */}
      <Modal isOpen={showModal} title={editingId ? 'Edit Service Record' : 'Record New Service'} onClose={handleCloseModal} onConfirm={handleSubmit} confirmText={editingId ? 'Update Record' : 'Save Record'} size="md" isLoading={loading}>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              💡 After creating a service record, go to Payments page to record customer payments.
            </p>
          </div>

          <FormGroup label="Select Car" error={errors.plateNumber} required>
            <select name="plateNumber" value={formData.plateNumber} onChange={handleChange} className="form-input" required>
              <option value="">-- Choose a vehicle --</option>
              {cars.map((car) => (<option key={car._id} value={car._id}>{car.plateNumber} - {car.model}</option>))}
            </select>
          </FormGroup>

          <FormGroup label="Select Service" error={errors.serviceCode} required>
            <select name="serviceCode" value={formData.serviceCode} onChange={handleChange} className="form-input" required>
              <option value="">-- Choose a service --</option>
              {services.map((service) => (<option key={service._id} value={service._id}>{service.serviceName} - {formatCurrency(service.servicePrice)}</option>))}
            </select>
          </FormGroup>

          {selectedService && (
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Service Price:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(selectedService.servicePrice)}</span>
              </div>
            </div>
          )}

          <FormGroup label="Service Date" error={errors.serviceDate} required>
            <Input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} max={today} required />
          </FormGroup>

          <FormGroup label="Expected Payment Date" error={errors.paymentDate} required>
            <Input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} max={today} min={formData.serviceDate} required />
            <p className="text-xs text-slate-500 mt-1">Expected date when customer will pay</p>
          </FormGroup>

          <FormGroup label="Mechanic Name" error={errors.doneBy} required>
            <Input type="text" name="doneBy" value={formData.doneBy} onChange={handleChange} placeholder="Enter mechanic's full name" />
          </FormGroup>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewDetails} title="Service Record Details" onClose={() => setViewDetails(false)} size="lg">
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-600 mb-3">🚗 Vehicle</h3>
                <p><strong>Plate:</strong> {selectedRecord.plateNumber?.plateNumber}</p>
                <p><strong>Model:</strong> {selectedRecord.plateNumber?.model}</p>
                <p><strong>Type:</strong> {selectedRecord.plateNumber?.type}</p>
                <p><strong>Year:</strong> {selectedRecord.plateNumber?.manufacturingYear}</p>
                <p><strong>Phone:</strong> {selectedRecord.plateNumber?.driverPhone}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-600 mb-3">🔧 Service</h3>
                <p><strong>Service:</strong> {selectedRecord.serviceCode?.serviceName}</p>
                <p><strong>Code:</strong> {selectedRecord.serviceCode?.serviceCode}</p>
                <p><strong>Price:</strong> {formatCurrency(selectedRecord.serviceCode?.servicePrice)}</p>
                <p><strong>Date:</strong> {formatDate(selectedRecord.serviceDate)}</p>
                <p><strong>Mechanic:</strong> {selectedRecord.doneBy}</p>
              </div>
              <div className="col-span-2 bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-600 mb-3">💰 Payment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-sm text-slate-500">Amount Paid</p><p className="font-bold text-green-600">{formatCurrency(selectedRecord.amountPaid || 0)}</p></div>
                  <div><p className="text-sm text-slate-500">Pending</p><p className="font-bold text-red-600">{formatCurrency((selectedRecord.serviceCode?.servicePrice || 0) - (selectedRecord.amountPaid || 0))}</p></div>
                  <div><p className="text-sm text-slate-500">Status</p><Badge type={selectedRecord.paymentStatus === 'Paid' ? 'success' : selectedRecord.paymentStatus === 'Partial' ? 'warning' : 'danger'}>{selectedRecord.paymentStatus}</Badge></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)} record={invoiceRecord} />
      <ConfirmDialog isOpen={deleteConfirm} title="Delete Service Record" message="Are you sure? This action cannot be undone." onConfirm={handleDelete} onCancel={() => { setDeleteConfirm(false); setSelectedRecord(null); }} isDanger isLoading={loading} />
    </div>
  );
};
