// ==================== RWANDAN VALIDATION HELPERS ====================

// Format Rwandan phone number (10 digits: 0788XXXXXX, 0728XXXXXX, etc.)
export const formatRwandanPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)}`;
  }
  return phone;
};

// Validate Rwandan phone number
export const validateRwandanPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Rwandan phone numbers: 07XXXXXXXX (10 digits) or 2507XXXXXXXX (12 digits with country code)
  const rwandanPattern = /^(07|2507)\d{8}$/;
  // Also accept 0788, 0783, 0785, 0786, 0787, 0789, 0728, 0738, 0798
  const localPattern = /^07(28|38|83|85|86|87|88|89|98)\d{6}$/;
  
  if (cleaned.length === 10) {
    return localPattern.test(cleaned);
  }
  if (cleaned.length === 12 && cleaned.startsWith('2507')) {
    return true;
  }
  return false;
};

// Validate Rwandan National ID (16 digits)
export const validateRwandanId = (id) => {
  if (!id) return false;
  const cleaned = id.replace(/\D/g, '');
  // Rwandan National ID: 16 digits (usually starts with 1, 2, or 3)
  return /^[1-3]\d{15}$/.test(cleaned);
};

// Validate Rwandan Driver's License
export const validateDriverLicense = (license) => {
  if (!license) return false;
  // Format: 2 letters + 7 digits (e.g., AB1234567)
  return /^[A-Z]{2}\d{7}$/i.test(license);
};

// Validate Vehicle Plate Number (Rwanda format)
export const validatePlateNumber = (plate) => {
  if (!plate) return false;
  const cleaned = plate.toUpperCase().replace(/\s/g, '');
  // Rwanda plate formats: 
  // - ABC123D (old format)
  // - RAB 123C (new format with R)
  // - RAB123C (without space)
  const pattern = /^([A-Z]{3}\d{3}[A-Z]?|R[A-Z]{2}\d{3}[A-Z]?)$/;
  return pattern.test(cleaned);
};

// Format plate number for display
export const formatPlateNumber = (plate) => {
  if (!plate) return '';
  const cleaned = plate.toUpperCase().replace(/\s/g, '');
  if (cleaned.length >= 6) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }
  return plate;
};

// ==================== GENERAL VALIDATION ====================

// Date formatting
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Currency formatting (Rwandan Franc)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Phone number formatting (general)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};

// Validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

export const validateUsername = (username) => {
  return username && username.length >= 3;
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Validate positive number
export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

// Validate required field
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Validate year (between 1900 and current year + 1)
export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const num = parseInt(year);
  return !isNaN(num) && num >= 1900 && num <= currentYear + 1;
};

// File download utility
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Generate random color
export const getRandomColor = () => {
  const colors = [
    '#0ea5e9',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#6366f1',
    '#ef4444',
    '#14b8a6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce function
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Truncate text
export const truncateText = (text, length) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Unpaid':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

// Get status badge color
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};