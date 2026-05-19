// Replace the validateForm function with this:
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
  
  // Phone validation (Rwandan format - supports 078, 079, 072, +250)
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