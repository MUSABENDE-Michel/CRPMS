import React, { useState, useEffect, useCallback } from 'react';
import { paymentAPI, serviceRecordAPI, carAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, validateRequired, validateAmount } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination, Badge } from '../components/UI';
import { Plus, Edit2, Trash2, Search, Eye, DollarSign, Calendar, User, CreditCard } from 'lucide-react';

const PaymentsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    serviceRecordId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    receivedBy: '',
    paymentMethod: 'Cash',
  });
  const [errors, setErrors] = useState({});

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, revenueRes, recordsRes, carsRes] = await Promise.all([
        paymentAPI.getPayments(currentPage, 10, search),
        paymentAPI.getDailyRevenue(),
        serviceRecordAPI.getServiceRecords(1, 100),
        carAPI.getCars(1, 100),
      ]);

      setPayments(paymentsRes.data.data || []);
      setTotalPages(paymentsRes.data.pagination?.pages || 1);
      setDailyRevenue(revenueRes.data.totalRevenue || 0);
      setServiceRecords(recordsRes.data.data || []);
      setCars(carsRes.data.data || []);
    } catch (error) {
      addToast('Error fetching payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch monthly revenue when month/year changes
  const fetchMonthlyRevenue = useCallback(async () => {
    try {
      const response = await paymentAPI.getMonthlyRevenue(selectedMonth, selectedYear);
      setMonthlyRevenue(response.data.totalRevenue || 0);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchMonthlyRevenue();
  }, [fetchMonthlyRevenue]);

  const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditingId(payment._id);
      setFormData({
        serviceRecordId: payment.serviceRecordId?._id || '',
        paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
        amountPaid: payment.amountPaid.toString(),
        receivedBy: payment.receivedBy,
        paymentMethod: payment.paymentMethod || 'Cash',
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceRecordId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amountPaid: '',
        receivedBy: '',
        paymentMethod: 'Cash',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      serviceRecordId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      receivedBy: '',
      paymentMethod: 'Cash',
    });
    setErrors({});
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.serviceRecordId)) {
      newErrors.serviceRecordId = 'Service record is required';
    }

    if (!validateRequired(formData.amountPaid)) {
      newErrors.amountPaid = 'Amount is required';
    } else if (!validateAmount(formData.amountPaid, 10000000)) {
      newErrors.amountPaid = 'Amount must be positive (max 10,000,000 RWF)';
    }

    if (!validateRequired(formData.receivedBy)) {
      newErrors.receivedBy = 'Received by is required';
    } else if (formData.receivedBy.length < 3) {
      newErrors.receivedBy = 'Name must be at least 3 characters';
    }

    if (!validateRequired(formData.paymentDate)) {
      newErrors.paymentDate = 'Payment date is required';
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
        await paymentAPI.updatePayment(editingId, data);
        addToast('Payment updated successfully', 'success');
      } else {
        await paymentAPI.recordPayment(data);
        addToast('Payment recorded successfully', 'success');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving payment';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await paymentAPI.deletePayment(selectedPayment._id);
      addToast('Payment deleted successfully', 'success');
      setDeleteConfirm(false);
      setSelectedPayment(null);
      fetchData();
    } catch (error) {
      addToast('Error deleting payment', 'error');
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

  // Get selected service record details
  const selectedServiceRecord = serviceRecords.find(s => s._id === formData.serviceRecordId);
  const maxAmount = selectedServiceRecord?.serviceCode?.servicePrice || 0;

  // Get car info for service record
  const getCarInfo = (serviceRecordId) => {
    const record = serviceRecords.find(s => s._id === serviceRecordId);
    const car = cars.find(c => c._id === record?.plateNumber?._id);
    return {
      plate: car?.plateNumber || 'N/A',
      model: car?.model || 'N/A',
      serviceName: record?.serviceCode?.serviceName || 'N/A',
      servicePrice: record?.serviceCode?.servicePrice || 0,
      remainingBalance: (record?.serviceCode?.servicePrice || 0) - (record?.amountPaid || 0),
    };
  };

  if (loading && payments.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  // Payment method colors
  const getMethodColor = (method) => {
    switch (method) {
      case 'Cash': return 'badge-success';
      case 'Card': return 'badge-primary';
      case 'Check': return 'badge-warning';
      case 'Transfer': return 'badge-secondary';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and manage all payment transactions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Record Payment
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Revenue Card */}
        <div className="card bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(dailyRevenue)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 w-20 bg-white dark:bg-slate-800"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments by received by or car plate..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment History</h2>
          <Badge type="primary">{payments.length} payments</Badge>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            title="No payments recorded"
            description="Record your first payment to get started"
            action={
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Record Payment
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Car Plate</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Service</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Payment Date</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Received By</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const carInfo = getCarInfo(payment.serviceRecordId?._id);
                return (
                  <tr key={payment._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {carInfo.plate}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {carInfo.serviceName}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(payment.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {payment.receivedBy}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.paymentMethod)}`}>
                        {payment.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(payment)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit payment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setDeleteConfirm(true);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Payment' : 'Record New Payment'}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? 'Update' : 'Record'}
        cancelText="Cancel"
        size="md"
        isLoading={loading}
      >
        <div className="space-y-4">
          <FormGroup label="Service Record" error={errors.serviceRecordId} required>
            <select
              name="serviceRecordId"
              value={formData.serviceRecordId}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a service record</option>
              {serviceRecords.map((record) => {
                const car = cars.find(c => c._id === record.plateNumber?._id);
                return (
                  <option key={record._id} value={record._id}>
                    {car?.plateNumber || 'N/A'} - {record.serviceCode?.serviceName} - {formatCurrency(record.serviceCode?.servicePrice)}
                  </option>
                );
              })}
            </select>
          </FormGroup>

          {selectedServiceRecord && (
            <div className="space-y-2 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">Service Details:</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  Car: {getCarInfo(selectedServiceRecord._id).plate}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  Service: {selectedServiceRecord.serviceCode?.serviceName}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  Total Price: {formatCurrency(selectedServiceRecord.serviceCode?.servicePrice)}
                </p>
                <p className="font-medium text-slate-900 dark:text-white">
                  Already Paid: {formatCurrency(selectedServiceRecord.amountPaid || 0)}
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Remaining: {formatCurrency((selectedServiceRecord.serviceCode?.servicePrice || 0) - (selectedServiceRecord.amountPaid || 0))}
                </p>
              </div>
            </div>
          )}

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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Maximum amount: {formatCurrency(maxAmount)}
              </p>
            )}
          </FormGroup>

          <FormGroup label="Payment Date" error={errors.paymentDate} required>
            <Input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup label="Received By" error={errors.receivedBy} required>
            <Input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleChange}
              placeholder="Name of person receiving payment"
              error={!!errors.receivedBy}
            />
          </FormGroup>

          <FormGroup label="Payment Method" required>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Check">Check</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </FormGroup>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        title="Payment Details"
        onClose={() => setShowDetailsModal(false)}
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Car Plate</label>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded text-sm">
                    {getCarInfo(selectedPayment.serviceRecordId?._id).plate}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Service</label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {getCarInfo(selectedPayment.serviceRecordId?._id).serviceName}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Amount Paid</label>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  {formatCurrency(selectedPayment.amountPaid)}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Payment Date</label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatDate(selectedPayment.paymentDate)}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Received By</label>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <User className="w-3 h-3" /> {selectedPayment.receivedBy}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Payment Method</label>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> {selectedPayment.paymentMethod || 'Cash'}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Service Price</label>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(getCarInfo(selectedPayment.serviceRecordId?._id).servicePrice)}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400">Remaining Balance</label>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  {formatCurrency(getCarInfo(selectedPayment.serviceRecordId?._id).remainingBalance)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">Transaction ID</label>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{selectedPayment._id}</p>
              <label className="text-xs text-slate-500 dark:text-slate-400 mt-2">Recorded At</label>
              <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(selectedPayment.createdAt)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment of ${selectedPayment ? formatCurrency(selectedPayment.amountPaid) : ''}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedPayment(null);
        }}
        isDanger
        isLoading={loading}
      />
    </div>
  );
};

export default PaymentsPage;