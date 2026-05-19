import React, { useState, useEffect, useCallback } from 'react';
import { carAPI, serviceRecordAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { 
  formatCurrency, 
  formatDate,
  validateRwandanPhone,
  validatePlateNumber,
  validateRequired,
  validateYear,
  formatRwandanPhone,
  formatPlateNumber,
  getPaymentStatusColor
} from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination } from '../components/UI';
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

  // Car types common in Rwanda
  const carTypes = [
    'Sedan', 'SUV', 'Hatchback', 'Pickup', 'Minibus', 'Bus', 
    'Motorcycle', 'Truck', 'Van', 'Coupe', 'Convertible'
  ];

  const fetchCars = useCallback(async () => {
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
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

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

  // Enhanced validation with Rwandan rules
  const validateForm = () => {
    const newErrors = {};
    
    // Plate Number validation (Rwanda format)
    if (!validateRequired(formData.plateNumber)) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (!validatePlateNumber(formData.plateNumber)) {
      newErrors.plateNumber = 'Invalid plate number format. Examples: RAB123C, ABC123D';
    }
    
    // Car type validation
    if (!validateRequired(formData.type)) {
      newErrors.type = 'Car type is required';
    }
    
    // Model validation
    if (!validateRequired(formData.model)) {
      newErrors.model = 'Model is required';
    } else if (formData.model.length < 2) {
      newErrors.model = 'Model must be at least 2 characters';
    }
    
    // Year validation
    if (!validateRequired(formData.manufacturingYear)) {
      newErrors.manufacturingYear = 'Manufacturing year is required';
    } else if (!validateYear(formData.manufacturingYear)) {
      newErrors.manufacturingYear = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }
    
    // Phone validation (Rwandan format)
    if (!validateRequired(formData.driverPhone)) {
      newErrors.driverPhone = 'Phone number is required';
    } else if (!validateRwandanPhone(formData.driverPhone)) {
      newErrors.driverPhone = 'Invalid Rwandan phone number. Formats: 0788XXXXXX, 0798XXXXXX, 0728XXXXXX, +250788XXXXXX';
    }
    
    // Mechanic name validation
    if (!validateRequired(formData.mechanicName)) {
      newErrors.mechanicName = 'Mechanic name is required';
    } else if (formData.mechanicName.length < 3) {
      newErrors.mechanicName = 'Mechanic name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        plateNumber: formData.plateNumber.toUpperCase().replace(/\s/g, ''),
        manufacturingYear: parseInt(formData.manufacturingYear),
        driverPhone: formData.driverPhone.replace(/\D/g, ''),
      };
      
      if (editingId) {
        await carAPI.updateCar(editingId, submitData);
        addToast('Car updated successfully', 'success');
      } else {
        await carAPI.createCar(submitData);
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
            placeholder="Search cars by plate, type, model, or mechanic..."
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
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Mechanic</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {formatPlateNumber(car.plateNumber)}
                   </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.model}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.manufacturingYear}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {formatRwandanPhone(car.driverPhone)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{car.mechanicName}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => handleViewHistory(car)}
                      className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="View service history"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(car)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit car"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete car"
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
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Car' : 'Add New Car'}
        onClose={handleCloseModal}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Plate Number" error={errors.plateNumber} required>
            <Input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              placeholder="e.g., RAB123C or ABC123D"
              error={!!errors.plateNumber}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Format: RAB123C, ABC123D (Rwanda standard)
            </p>
          </FormGroup>

          <FormGroup label="Car Type" error={errors.type} required>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select car type</option>
              {carTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Model" error={errors.model} required>
            <Input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Toyota Corolla, BMW X5"
              error={!!errors.model}
            />
          </FormGroup>

          <FormGroup label="Manufacturing Year" error={errors.manufacturingYear} required>
            <Input
              type="number"
              name="manufacturingYear"
              value={formData.manufacturingYear}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              step="1"
              error={!!errors.manufacturingYear}
            />
          </FormGroup>

          <FormGroup label="Driver Phone" error={errors.driverPhone} required>
            <Input
              type="tel"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              placeholder="0788XXXXXX, 0798XXXXXX, or +250788XXXXXX"
              error={!!errors.driverPhone}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rwandan phone number: 078, 079, or 072 followed by 7 digits
            </p>
          </FormGroup>

          <FormGroup label="Mechanic Name" error={errors.mechanicName} required>
            <Input
              type="text"
              name="mechanicName"
              value={formData.mechanicName}
              onChange={handleChange}
              placeholder="Full name of assigned mechanic"
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
            <button type="button" onClick={handleCloseModal} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Service History Modal */}
      <Modal
        isOpen={viewHistory}
        title={`Service History - ${selectedCar ? formatPlateNumber(selectedCar.plateNumber) : ''}`}
        onClose={() => setViewHistory(false)}
        size="lg"
      >
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Mechanic: {record.doneBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(record.amountPaid)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Car"
        message={`Are you sure you want to delete ${selectedCar?.plateNumber} (${selectedCar?.model})? This action cannot be undone.`}
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