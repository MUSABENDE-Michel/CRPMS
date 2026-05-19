import React, { useEffect } from 'react';
import { useToast } from '../hooks/useCustomHooks';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div className={`alert border ${colors[type]} animate-fade-in`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Modal with proper buttons and scroll prevention
export const Modal = ({ 
  isOpen, 
  title, 
  children, 
  onClose, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDelete = false, 
  size = 'md',
  isLoading = false
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const handleCancel = onCancel || onClose;

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Modal Footer - ALWAYS SHOW BUTTONS */}
        <div className="flex gap-3 justify-end p-6 border-t border-slate-200 dark:border-slate-800">
          <button 
            type="button"
            onClick={handleCancel} 
            className="btn btn-outline"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={isDelete ? 'btn btn-danger' : 'btn btn-primary'}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const Loading = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return <div className={`spinner ${sizes[size]}`}></div>;
};

export const SkeletonLoader = ({ count = 1, type = 'text' }) => {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card space-y-4">
            <div className="skeleton h-12 w-12 rounded-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 flex-1"></div>
            <div className="skeleton h-4 flex-1"></div>
            <div className="skeleton h-4 flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-text"></div>
      ))}
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false, isDanger = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      onConfirm={onConfirm}
      confirmText="Delete"
      cancelText="Cancel"
      isDelete={isDanger}
      isLoading={isLoading}
    >
      <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </Modal>
  );
};

export const FormGroup = ({ label, error, required, children }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export const Input = React.forwardRef(
  ({ error, ...props }, ref) => (
    <input
      ref={ref}
      className={`form-input ${error ? 'form-input-error' : ''}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={`form-input ${error ? 'form-input-error' : ''}`}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = 'Select';

export const Textarea = React.forwardRef(
  ({ error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`form-input resize-vertical min-h-24 ${error ? 'form-input-error' : ''}`}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export const Badge = ({ children, type = 'primary' }) => {
  const types = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return <span className={`badge ${types[type]}`}>{children}</span>;
};

export const Alert = ({ type = 'info', title, children, icon: Icon }) => {
  return (
    <div className={`alert-${type}`}>
      {Icon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      <div>
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {children}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon className="w-12 h-12 text-slate-400 mb-4" />}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-slate-600 dark:text-slate-400 mb-4 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-outline btn-sm disabled:opacity-50"
      >
        Previous
      </button>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-outline btn-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};