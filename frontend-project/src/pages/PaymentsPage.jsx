import React, { useState, useEffect, useCallback } from 'react';
import { paymentAPI, serviceRecordAPI, carAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, formatDate, validateRequired, validateAmount } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination, Badge } from '../components/UI';
import { Plus, Edit2, Trash2, Search, Eye, DollarSign, TrendingUp, CreditCard, AlertCircle, CheckCircle, Clock, XCircle, Printer } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

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
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceRecord, setInvoiceRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [formData, setFormData] = useState({
    serviceRecordId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: '',
    receivedBy: '',
    paymentMethod: 'Cash',
  });
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, recordsRes, carsRes, revenueRes] = await Promise.all([
        paymentAPI.getPayments(currentPage, 10, search),
        serviceRecordAPI.getServiceRecords(1, 100),
        carAPI.getCars(1, 100),
        paymentAPI.getDailyRevenue(),
      ]);
      setPayments(paymentsRes.data.data || []);
      setTotalPages(paymentsRes.data.pagination?.pages || 1);
      setServiceRecords(recordsRes.data.data || []);
      setCars(carsRes.data.data || []);
      setDailyRevenue(revenueRes.data.totalRevenue || 0);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        paymentDate: today,
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
  };

  const handlePrintInvoice = (payment) => {
    setInvoiceRecord(payment.serviceRecordId);
    setShowInvoice(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const selectedRecord = serviceRecords.find(s => s._id === formData.serviceRecordId);
    const remainingAmount = (selectedRecord?.serviceCode?.servicePrice || 0) - (selectedRecord?.amountPaid || 0);
    
    if (!validateRequired(formData.serviceRecordId)) {
      newErrors.serviceRecordId = 'Please select a service record';
    }
    if (!validateRequired(formData.amountPaid)) {
      newErrors.amountPaid = 'Amount is required';
    } else if (!validateAmount(formData.amountPaid, 10000000)) {
      newErrors.amountPaid = 'Amount must be positive (max 10,000,000 RWF)';
    } else if (parseFloat(formData.amountPaid) > remainingAmount) {
      newErrors.amountPaid = `Amount cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`;
    }
    if (!validateRequired(formData.receivedBy)) {
      newErrors.receivedBy = 'Received by is required';
    } else if (formData.receivedBy.length < 3) {
      newErrors.receivedBy = 'Name must be at least 3 characters';
    }
    if (!validateRequired(formData.paymentDate)) {
      newErrors.paymentDate = 'Payment date is required';
    } else if (formData.paymentDate > today) {
      newErrors.paymentDate = 'Payment date cannot be in the future';
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

  const selectedServiceRecord = serviceRecords.find(s => s._id === formData.serviceRecordId);
  const remainingAmount = (selectedServiceRecord?.serviceCode?.servicePrice || 0) - (selectedServiceRecord?.amountPaid || 0);

  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Card': return 'bg-blue-100 text-blue-800';
      case 'Mobile': return 'bg-purple-100 text-purple-800';
      case 'Transfer': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && payments.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record and track customer payments for services
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" />
          Record Payment
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(dailyRevenue)}</p>
              <p className="text-xs text-green-200 mt-1">{today}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="text-sm border border-white/30 rounded-lg px-2 py-1 bg-white/20 text-white">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('default', { month: 'long' })}</option>)}
                </select>
                <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="text-sm border border-white/30 rounded-lg px-2 py-1 w-20 bg-white/20 text-white" />
              </div>
              <p className="text-blue-100 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search by car plate or received by..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="form-input pl-10 w-full" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h2 className="text-lg font-semibold">Payment History</h2>
          <Badge type="primary">{payments.length} payments</Badge>
        </div>

        {payments.length === 0 ? (
          <EmptyState title="No payments recorded" description="Record your first payment" action={<button onClick={() => handleOpenModal()} className="btn btn-primary">Record Payment</button>} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold">Car Plate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Service Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Payment Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Received By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold">Method</th>
                <th className="text-center px-4 py-3 text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const car = cars.find(c => c._id === payment.serviceRecordId?.plateNumber?._id);
                return (
                  <tr key={payment._id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-primary-600">{car?.plateNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{payment.serviceRecordId?.serviceCode?.serviceName || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(payment.serviceRecordId?.serviceDate)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">{formatCurrency(payment.amountPaid)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 text-sm">{payment.receivedBy}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.paymentMethod)}`}>{payment.paymentMethod || 'Cash'}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handlePrintInvoice(payment)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="Print Invoice"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal(payment)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedPayment(payment); setDeleteConfirm(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

      {/* Payment Modal */}
      <Modal isOpen={showModal} title={editingId ? 'Edit Payment' : 'Record Payment'} onClose={handleCloseModal} onConfirm={handleSubmit} confirmText={editingId ? 'Update' : 'Record Payment'} size="md" isLoading={loading}>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Select a service record to record customer payment</p>
          </div>

          <FormGroup label="Service Record" error={errors.serviceRecordId} required>
            <select name="serviceRecordId" value={formData.serviceRecordId} onChange={handleChange} className="form-input" required>
              <option value="">Select unpaid/partial service</option>
              {serviceRecords.filter(r => r.paymentStatus !== 'Paid').map((record) => {
                const car = cars.find(c => c._id === record.plateNumber?._id);
                const price = record.serviceCode?.servicePrice || 0;
                const paid = record.amountPaid || 0;
                const remaining = price - paid;
                return (<option key={record._id} value={record._id}>{car?.plateNumber} - {record.serviceCode?.serviceName} | Paid: {formatCurrency(paid)} | Remaining: {formatCurrency(remaining)}</option>);
              })}
            </select>
          </FormGroup>

          {selectedServiceRecord && (
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg space-y-2">
              <div className="flex justify-between"><span className="text-sm">Service Price:</span><span className="font-bold">{formatCurrency(selectedServiceRecord.serviceCode?.servicePrice)}</span></div>
              <div className="flex justify-between"><span className="text-sm">Already Paid:</span><span className="font-bold text-green-600">{formatCurrency(selectedServiceRecord.amountPaid || 0)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="text-sm font-bold">Remaining Balance:</span><span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span></div>
            </div>
          )}

          <FormGroup label="Amount to Pay (RWF)" error={errors.amountPaid} required>
            <Input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} step="1000" min="0" max={remainingAmount} placeholder="Enter amount customer is paying" />
            {remainingAmount > 0 && <p className="text-xs text-slate-500 mt-1">Maximum amount: {formatCurrency(remainingAmount)}</p>}
          </FormGroup>

          <FormGroup label="Payment Date" error={errors.paymentDate} required>
            <Input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} max={today} required />
          </FormGroup>

          <FormGroup label="Received By" error={errors.receivedBy} required>
            <Input type="text" name="receivedBy" value={formData.receivedBy} onChange={handleChange} placeholder="Name of person receiving payment" />
          </FormGroup>

          <FormGroup label="Payment Method" required>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-input">
              <option value="Cash">💵 Cash</option>
              <option value="Card">💳 Card</option>
              <option value="Mobile">📱 Mobile Money (MTN/Airtel)</option>
              <option value="Transfer">🏦 Bank Transfer</option>
            </select>
          </FormGroup>
        </div>
      </Modal>

      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)} record={invoiceRecord} />
      <ConfirmDialog isOpen={deleteConfirm} title="Delete Payment" message="Are you sure? This will update the service record payment status." onConfirm={handleDelete} onCancel={() => { setDeleteConfirm(false); setSelectedPayment(null); }} isDanger isLoading={loading} />
    </div>
  );
};

export default PaymentsPage;
