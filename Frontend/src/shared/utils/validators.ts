/**
 * Validators Utilities
 * Functions for data validation
 */

// ============= EMAIL VALIDATION =============
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============= PHONE VALIDATION =============
export const validatePhoneNumber = (phone: string): boolean => {
  // Indonesian phone number format: starts with 0 or +62, followed by 9-12 digits
  const phoneRegex = /^(?:(?:\+|00)62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

export const validatePhoneNumberStrict = (phone: string): boolean => {
  // Strict Indonesian phone: 08XX-XXXX-XXXX format
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 13;
};

// ============= PASSWORD VALIDATION =============
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf besar");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password harus mengandung huruf kecil");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung angka");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password harus mengandung karakter spesial (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= COORDINATE VALIDATION =============
export const validateCoordinates = (
  lat: number,
  lng: number
): { isValid: boolean; error?: string } => {
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: "Latitude harus antara -90 dan 90" };
  }
  if (lng < -180 || lng > 180) {
    return { isValid: false, error: "Longitude harus antara -180 dan 180" };
  }
  return { isValid: true };
};

// ============= TIME VALIDATION =============
export const validateTimeFormat = (time: string): boolean => {
  // HH:mm format
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateTimeWindow = (
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string } => {
  if (!validateTimeFormat(startTime)) {
    return { isValid: false, error: "Format jam mulai tidak valid (HH:mm)" };
  }
  if (!validateTimeFormat(endTime)) {
    return { isValid: false, error: "Format jam selesai tidak valid (HH:mm)" };
  }

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  if (startTotalMin >= endTotalMin) {
    return { isValid: false, error: "Jam mulai harus lebih awal dari jam selesai" };
  }

  return { isValid: true };
};

// ============= DATE VALIDATION =============
export const validateDateFormat = (date: string): boolean => {
  // ISO 8601 format
  return !isNaN(Date.parse(date));
};

export const validateDateRange = (
  startDate: string,
  endDate: string
): { isValid: boolean; error?: string } => {
  if (!validateDateFormat(startDate)) {
    return { isValid: false, error: "Format tanggal mulai tidak valid" };
  }
  if (!validateDateFormat(endDate)) {
    return { isValid: false, error: "Format tanggal selesai tidak valid" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return { isValid: false, error: "Tanggal mulai harus lebih awal dari tanggal selesai" };
  }

  return { isValid: true };
};

// ============= WEIGHT & VOLUME VALIDATION =============
export const validateWeight = (
  weight: number,
  min: number = 0.1,
  max: number = 100000
): { isValid: boolean; error?: string } => {
  if (weight < min) {
    return { isValid: false, error: `Berat minimal ${min} kg` };
  }
  if (weight > max) {
    return { isValid: false, error: `Berat maksimal ${max} kg` };
  }
  return { isValid: true };
};

export const validateVolume = (
  volume: number,
  min: number = 0.001,
  max: number = 50
): { isValid: boolean; error?: string } => {
  if (volume < min) {
    return { isValid: false, error: `Volume minimal ${min} m³` };
  }
  if (volume > max) {
    return { isValid: false, error: `Volume maksimal ${max} m³` };
  }
  return { isValid: true };
};

// ============= LICENSE VALIDATION =============
export const validateLicensePlate = (plate: string): boolean => {
  // Indonesian license plate: ABC XXXX ABC or AB 1234 CD
  const plateRegex = /^[A-Z]{1,2}(\s|)?\d{1,4}(\s|)?[A-Z]{1,3}$/i;
  return plateRegex.test(plate.trim());
};

export const validateLicenseNumber = (license: string): boolean => {
  // Indonesian driver's license: 8-16 digits
  const licenseRegex = /^\d{8,16}$/;
  return licenseRegex.test(license.replace(/\D/g, ""));
};

// ============= FORM VALIDATION =============
export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
  return value.trim().length <= max;
};

export const validateRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

// ============= FILE VALIDATION =============
export const validateFileSize = (
  fileSize: number,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: `Ukuran file maksimal ${maxSizeMB}MB`,
    };
  }
  return { isValid: true };
};
