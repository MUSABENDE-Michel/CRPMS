import React, { useState, useEffect } from 'react';
import { serviceRecordAPI, paymentAPI, carAPI, serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, EmptyState, Pagination } from '../components/UI';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, [currentPage, search]);

  const fetchData = async () => {
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
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({
        serviceDate: new Date(record.serviceDate).toISOString().split('T')[0],
        plateNumber: record.plateNumber._id,
        serviceCode: record.serviceCode._id,
        amountPaid: record.amountPaid.toString(),
        paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
        paymentStatus: record.paymentStatus,
        doneBy: record.doneBy,
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceDate: new Date().toISOString().split('T')[0],
        plateNumber: '',
        serviceCode: '',
        amountPaid: '',
        paymentDate: new Date().toISOString().split('T')[0],
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plateNumber) newErrors.plateNumber = 'Car is required';
    if (!formData.serviceCode) newErrors.serviceCode = 'Service is required';
    if (!formData.amountPaid) newErrors.amountPaid = 'Amount is required';
    if (!formData.doneBy) newErrors.doneBy = 'Mechanic name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      addToast(error.response?.data?.message || 'Error saving record', 'error');
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

  if (loading && records.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Records</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Record Service
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {records.length === 0 ? (
          <EmptyState
            title="No service records"
            description="Record your first service to get started"
            action={<button onClick={() => handleOpenModal()} className="btn btn-primary">Record Service</button>}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-sm font-semibold">Car</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Service</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Date</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Amount Paid</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium">{record.plateNumber?.plateNumber}</td>
                  <td className="px-6 py-4 text-sm">{record.serviceCode?.serviceName}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(record.serviceDate)}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(record.amountPaid)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button onClick={() => handleOpenModal(record)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Record' : 'Record Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <FormGroup label="Car" error={errors.plateNumber} required>
                <select
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select a car</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>
                      {car.plateNumber} ({car.model})
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
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.serviceName} ({formatCurrency(service.servicePrice)})
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label="Service Date" required>
                <Input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup label="Amount Paid" error={errors.amountPaid} required>
                <Input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup label="Payment Date" required>
                <Input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                />
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

              <FormGroup label="Done By" error={errors.doneBy} required>
                <Input
                  type="text"
                  name="doneBy"
                  value={formData.doneBy}
                  onChange={handleChange}
                  placeholder="Mechanic name"
                />
              </FormGroup>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleCloseModal} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this record?"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedRecord(null);
        }}
        isDanger
      />
    </div>
  );
};

// Payments Page
export const PaymentsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dailyRevenue, setDailyRevenue] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, search]);

  const fetchPayments = async () => {
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
  };

  if (loading && payments.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Today's Revenue</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(dailyRevenue)}</p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {payments.length === 0 ? (
          <EmptyState title="No payments recorded" description="Payment history will appear here" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-sm font-semibold">Received By</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Date</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium">{payment.receivedBy}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(payment.amountPaid)}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(payment.paymentDate)}</td>
                  <td className="px-6 py-4 text-sm">{payment.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  );
};
