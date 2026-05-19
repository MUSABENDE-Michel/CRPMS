import React, { useState, useEffect, useCallback } from 'react';
import { serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, validateRequired, validatePrice } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination } from '../components/UI';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const ServicesPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    serviceCode: '',
    serviceName: '',
    servicePrice: '',
    serviceDescription: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getServices(currentPage, 10, search);
      setServices(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      addToast('Error fetching services', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, addToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingId(service._id);
      setFormData({
        serviceCode: service.serviceCode,
        serviceName: service.serviceName,
        servicePrice: service.servicePrice.toString(),
        serviceDescription: service.serviceDescription || '',
        status: service.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        serviceCode: '',
        serviceName: '',
        servicePrice: '',
        serviceDescription: '',
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
      serviceCode: '',
      serviceName: '',
      servicePrice: '',
      serviceDescription: '',
      status: 'Active',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.serviceCode)) {
      newErrors.serviceCode = 'Service code is required';
    } else if (formData.serviceCode.length < 3) {
      newErrors.serviceCode = 'Service code must be at least 3 characters';
    } else if (!/^[A-Z0-9\-]+$/i.test(formData.serviceCode)) {
      newErrors.serviceCode = 'Service code can only contain letters, numbers, and hyphens';
    }
    
    if (!validateRequired(formData.serviceName)) {
      newErrors.serviceName = 'Service name is required';
    } else if (formData.serviceName.length < 3) {
      newErrors.serviceName = 'Service name must be at least 3 characters';
    }
    
    if (!validateRequired(formData.servicePrice)) {
      newErrors.servicePrice = 'Price is required';
    } else if (!validatePrice(formData.servicePrice)) {
      newErrors.servicePrice = 'Price must be a positive number (max 10,000,000 RWF)';
    }
    
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
        serviceCode: formData.serviceCode.toUpperCase(),
        servicePrice: parseFloat(formData.servicePrice),
      };

      if (editingId) {
        await serviceAPI.updateService(editingId, data);
        addToast('Service updated successfully', 'success');
      } else {
        await serviceAPI.createService(data);
        addToast('Service created successfully', 'success');
      }
      handleCloseModal();
      fetchServices();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving service', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await serviceAPI.deleteService(selectedService._id);
      addToast('Service deleted successfully', 'success');
      setDeleteConfirm(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      addToast('Error deleting service', 'error');
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

  if (loading && services.length === 0) {
    return <SkeletonLoader count={5} type="table" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services by code or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="card overflow-x-auto">
        {services.length === 0 ? (
          <EmptyState
            title="No services found"
            description="Add your first service to get started"
            action={
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Add Service
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Code</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Description</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
               </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{service.serviceCode}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{service.serviceName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(service.servicePrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {service.serviceDescription ? (service.serviceDescription.length > 30 ? `${service.serviceDescription.substring(0, 30)}...` : service.serviceDescription) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete service"
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
        title={editingId ? 'Edit Service' : 'Add New Service'}
        onClose={handleCloseModal}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Service Code" error={errors.serviceCode} required>
            <Input
              type="text"
              name="serviceCode"
              value={formData.serviceCode}
              onChange={handleChange}
              placeholder="e.g., OIL-CHG, BRAKE-SVC"
              error={!!errors.serviceCode}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Use uppercase letters, numbers, and hyphens only
            </p>
          </FormGroup>

          <FormGroup label="Service Name" error={errors.serviceName} required>
            <Input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="e.g., Oil Change, Brake Service"
              error={!!errors.serviceName}
            />
          </FormGroup>

          <FormGroup label="Price (RWF)" error={errors.servicePrice} required>
            <Input
              type="number"
              name="servicePrice"
              value={formData.servicePrice}
              onChange={handleChange}
              placeholder="0.00"
              step="1000"
              min="0"
              max="10000000"
              error={!!errors.servicePrice}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maximum price: 10,000,000 RWF
            </p>
          </FormGroup>

          <FormGroup label="Description">
            <textarea
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleChange}
              placeholder="Service description (optional)"
              className="form-input resize-vertical min-h-24"
              rows="3"
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
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete ${selectedService?.serviceName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedService(null);
        }}
        isDanger
      />
    </div>
  );
};

export default ServicesPage;