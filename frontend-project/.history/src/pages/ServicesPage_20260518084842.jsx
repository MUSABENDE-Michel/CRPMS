import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../api/apiClient';
import { useToast } from '../hooks/useCustomHooks';
import { formatCurrency } from '../utils/helpers';
import { SkeletonLoader, ConfirmDialog, FormGroup, Input, EmptyState, Pagination } from '../components/UI';
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

  useEffect(() => {
    fetchServices();
  }, [currentPage, search]);

  const fetchServices = async () => {
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
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingId(service._id);
      setFormData({
        serviceCode: service.serviceCode,
        serviceName: service.serviceName,
        servicePrice: service.servicePrice.toString(),
        serviceDescription: service.serviceDescription,
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
    if (!formData.serviceCode) newErrors.serviceCode = 'Service code is required';
    if (!formData.serviceName) newErrors.serviceName = 'Service name is required';
    if (!formData.servicePrice) newErrors.servicePrice = 'Price is required';
    else if (parseFloat(formData.servicePrice) < 0) newErrors.servicePrice = 'Price must be positive';
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
            placeholder="Search services..."
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
            icon={null}
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
                    {service.serviceDescription?.substring(0, 30)}...
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
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              {editingId ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <FormGroup label="Service Code" error={errors.serviceCode} required>
                <Input
                  type="text"
                  name="serviceCode"
                  value={formData.serviceCode}
                  onChange={handleChange}
                  placeholder="e.g., OIL-CHG"
                  error={!!errors.serviceCode}
                />
              </FormGroup>

              <FormGroup label="Service Name" error={errors.serviceName} required>
                <Input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="e.g., Oil Change"
                  error={!!errors.serviceName}
                />
              </FormGroup>

              <FormGroup label="Price" error={errors.servicePrice} required>
                <Input
                  type="number"
                  name="servicePrice"
                  value={formData.servicePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  error={!!errors.servicePrice}
                />
              </FormGroup>

              <FormGroup label="Description">
                <textarea
                  name="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={handleChange}
                  placeholder="Service description"
                  className="form-input resize-vertical min-h-24"
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
