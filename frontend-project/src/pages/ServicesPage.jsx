import React, { useState, useEffect, useCallback } from 'react';
import { serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency, validateRequired, validatePrice } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, Modal, EmptyState, Pagination } from '../components/UI';
import { Plus, Edit2, Trash2, Search, DollarSign, Tag, Package, AlertCircle } from 'lucide-react';

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
    } else {
      const isDuplicate = services.some(s => 
        s.serviceCode === formData.serviceCode.toUpperCase() && s._id !== editingId
      );
      if (isDuplicate) {
        newErrors.serviceCode = 'This service code already exists!';
      }
    }
    
    if (!validateRequired(formData.serviceName)) {
      newErrors.serviceName = 'Service name is required';
    } else if (formData.serviceName.length < 3) {
      newErrors.serviceName = 'Service name must be at least 3 characters';
    } else {
      const isDuplicateName = services.some(s => 
        s.serviceName.toLowerCase() === formData.serviceName.toLowerCase() && s._id !== editingId
      );
      if (isDuplicateName) {
        newErrors.serviceName = 'This service name already exists!';
      }
    }
    
    if (!validateRequired(formData.servicePrice)) {
      newErrors.servicePrice = 'Price is required';
    } else if (!validatePrice(formData.servicePrice)) {
      newErrors.servicePrice = 'Price must be a positive number (max 10,000,000 RWF)';
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage repair services, pricing, and availability
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 transition-all shadow-lg btn btn-primary hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="text-white card bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100">Total Services</p>
              <p className="text-2xl font-bold">{services.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Active Services</p>
              <p className="text-2xl font-bold">{services.filter(s => s.status === 'Active').length}</p>
            </div>
            <Tag className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="text-white card bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Avg. Service Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(services.reduce((sum, s) => sum + s.servicePrice, 0) / (services.length || 1))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute w-5 h-5 left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search services by code, name, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 form-input"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-x-auto card">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Service List</h2>
          <span className="text-sm text-slate-500">{services.length} services found</span>
        </div>

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
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Code</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Service Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-right text-slate-900 dark:text-white">Price (RWF)</th>
                <th className="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Description</th>
                <th className="px-4 py-3 text-sm font-semibold text-center text-slate-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-center text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id} className="transition-colors border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">
                      {service.serviceCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                    {service.serviceName}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-green-600 dark:text-green-400">
                    {formatCurrency(service.servicePrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {service.serviceDescription ? (
                      service.serviceDescription.length > 40 ? 
                        `${service.serviceDescription.substring(0, 40)}...` : 
                        service.serviceDescription
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setDeleteConfirm(true);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete service"
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
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Service' : 'Add New Service'}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? 'Update Service' : 'Create Service'}
        cancelText="Cancel"
        size="md"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div className="p-3 mb-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <p className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
              <AlertCircle className="w-3 h-3" />
              Service code and name must be unique
            </p>
          </div>

          <FormGroup label="Service Code" error={errors.serviceCode} required>
            <Input
              type="text"
              name="serviceCode"
              value={formData.serviceCode}
              onChange={handleChange}
              placeholder="e.g., OIL-CHG, BRAKE-SVC"
              error={!!errors.serviceCode}
            />
            <p className="mt-1 text-xs text-slate-500">Use uppercase letters, numbers, and hyphens only</p>
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
            <p className="mt-1 text-xs text-slate-500">Maximum price: 10,000,000 RWF</p>
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
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.serviceName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirm(false);
          setSelectedService(null);
        }}
        isDanger
        isLoading={loading}
      />
    </div>
  );
};

export default ServicesPage;