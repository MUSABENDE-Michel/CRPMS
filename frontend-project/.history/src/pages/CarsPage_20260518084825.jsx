import React, { useState, useEffect } from 'react';
import { carAPI, serviceRecordAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatPhoneNumber, formatDate } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, EmptyState, Pagination } from '../components/UI';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';

const CarsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '',
    model: '',
    manufacturingYear: new Date().getFullYear(),
    driverPhone: '',
    mechanicName: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});
  const [viewHistory, setViewHistory] = useState(false);
  const [serviceHistory, setServiceHistory] = useState([]);

  useEffect(() => {
    fetchCars();
  }, [currentPage, search]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getCars(currentPage, 10, search);
      setCars(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      addToast('Error fetching cars', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingId(car._id);
      setFormData({
        plateNumber: car.plateNumber,
        type: car.type,
        model: car.model,
        manufacturingYear: car.manufacturingYear,
        driverPhone: car.driverPhone,
        mechanicName: car.mechanicName,
        status: car.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        plateNumber: '',
        type: '',
        model: '',
        manufacturingYear: new Date().getFullYear(),
        driverPhone: '',
        mechanicName: '',
        status: 'Active',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      plateNumber: '',
      type: '',
      model: '',
      manufacturingYear: new Date().getFullYear(),
      driverPhone: '',
      mechanicName: '',
      status: 'Active',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.type) newErrors.type = 'Car type is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.driverPhone) newErrors.driverPhone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.driverPhone.replace(/\D/g, ''))) {
      newErrors.driverPhone = 'Phone must be 10 digits';
    }
    if (!formData.mechanicName) newErrors.mechanicName = 'Mechanic name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingId) {
        await carAPI.updateCar(editingId, formData);
        addToast('Car updated successfully', 'success');
      } else {
        await carAPI.createCar(formData);
        addToast('Car created successfully', 'success');
      }
      handleCloseModal();
      fetchCars();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving car', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await carAPI.deleteCar(selectedCar._id);
      addToast('Car deleted successfully', 'success');
      setDeleteConfirm(false);
      setSelectedCar(null);
      fetchCars();
    } catch (error) {
      addToast('Error deleting car', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (car) => {
    try {
      setSelectedCar(car);
      const response = await serviceRecordAPI.getCarHistory(car._id);
      setServiceHistory(response.data.data || []);
      setViewHistory(true);
    } catch (error) {
      addToast('Error fetching service history', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (loading && cars.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cars Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Car
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cars by plate, type, or model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Cars Table */}
      <div className="card overflow-x-auto">
        {cars.length === 0 ? (
          <EmptyState
            icon={null}
            title="No cars found"
            description="Start by adding your first car to the system"
            action={
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Add New Car
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Plate</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Model</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Year</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{car.plateNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.model}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.manufacturingYear}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatPhoneNumber(car.driverPhone)}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => handleViewHistory(car)}
                      className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="View history"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(car)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Edit Car' : 'Add New Car'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <FormGroup label="Plate Number" error={errors.plateNumber} required>
                <Input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  placeholder="e.g., ABC-123"
                  error={!!errors.plateNumber}
                />
              </FormGroup>

              <FormGroup label="Car Type" error={errors.type} required>
                <Input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g., Sedan"
                  error={!!errors.type}
                />
              </FormGroup>

              <FormGroup label="Model" error={errors.model} required>
                <Input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Toyota Camry"
                  error={!!errors.model}
                />
              </FormGroup>

              <FormGroup label="Manufacturing Year" required>
                <Input
                  type="number"
                  name="manufacturingYear"
                  value={formData.manufacturingYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </FormGroup>

              <FormGroup label="Driver Phone" error={errors.driverPhone} required>
                <Input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  error={!!errors.driverPhone}
                />
              </FormGroup>

              <FormGroup label="Mechanic Name" error={errors.mechanicName} required>
                <Input
                  type="text"
                  name="mechanicName"
                  value={formData.mechanicName}
                  onChange={handleChange}
                  placeholder="Mechanic name"
                  error={!!errors.mechanicName}
                />
              </FormGroup>

              <FormGroup label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </FormGroup>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleCloseModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service History Modal */}
      {viewHistory && selectedCar && (
        <div className="modal-overlay" onClick={() => setViewHistory(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Service History - {selectedCar.plateNumber}
            </h2>

            {serviceHistory.length === 0 ? (
              <EmptyState title="No service records" description="This car has no service records yet" />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {serviceHistory.map((record) => (
                  <div key={record._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {record.serviceCode?.serviceName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {formatDate(record.serviceDate)}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${record.serviceCode?.servicePrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setViewHistory(false)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Car"
        message={`Are you sure you want to delete ${selectedCar?.plateNumber}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedCar(null);
        }}
        isDanger
      />
    </div>
  );
};

export default CarsPage;
