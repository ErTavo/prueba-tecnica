const isValidId = (id) => {
  const numId = parseInt(id);
  return !isNaN(numId) && numId > 0;
};

const validateRequiredFields = (fields) => {
  const missingFields = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(key);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidRole = (role) => {
  if (!role || typeof role !== 'string') {
    return false;
  }
  
  const validRoles = ['Admin', 'Tecnico', 'Supervisor'];
  return validRoles.includes(role);
};

const sanitizeInput = (input) => {
  if (input === null || input === undefined) {
    return '';
  }
  
  let str = String(input);
  str = str.trim();
  str = str.replace(/\s+/g, ' ');
  str = str.replace(/<[^>]*>/g, '');
  
  return str;
};

module.exports = {
  isValidId,
  validateRequiredFields,
  isValidEmail,
  isValidRole,
  sanitizeInput
};
