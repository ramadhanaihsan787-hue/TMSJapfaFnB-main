/**
 * Formatters Utilities
 * Functions for formatting and displaying data
 */

// ============= DATE & TIME FORMATTERS =============
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} menit`;
  if (mins === 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
};

export const formatTimeWindow = (start: string, end: string): string => {
  return `${start} - ${end}`;
};

// ============= NUMBER FORMATTERS =============
export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (
  num: number,
  decimals: number = 0,
  locale: string = "id-ID"
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ============= DISTANCE & WEIGHT FORMATTERS =============
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${Math.round(grams)} g`;
};

export const formatVolume = (cubicCm: number): string => {
  if (cubicCm >= 1000000) {
    return `${(cubicCm / 1000000).toFixed(2)} m³`;
  }
  if (cubicCm >= 1000) {
    return `${(cubicCm / 1000).toFixed(2)} L`;
  }
  return `${Math.round(cubicCm)} cm³`;
};

// ============= TEXT FORMATTERS =============
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format as Indonesian phone number: 08XX-XXXX-XXXX
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }
  return phone;
};

export const formatPlateNumber = (plate: string): string => {
  return plate.toUpperCase().trim();
};

export const formatName = (name: string): string => {
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// ============= COORDINATE FORMATTERS =============
export const formatCoordinates = (lat: number, lng: number, decimals: number = 6): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

export const formatCoordinatesForMap = (lat: number, lng: number): [number, number] => {
  return [lat, lng];
};

// ============= STATUS FORMATTERS =============
export const formatOrderStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    pending: { label: "Menunggu", color: "yellow" },
    assigned: { label: "Ditetapkan", color: "blue" },
    picked_up: { label: "Diambil", color: "blue" },
    in_transit: { label: "Dalam Pengiriman", color: "purple" },
    arrived: { label: "Tiba", color: "cyan" },
    delivered: { label: "Terkirim", color: "green" },
    failed: { label: "Gagal", color: "red" },
    cancelled: { label: "Dibatalkan", color: "gray" },
  };
  
  return statusMap[status] || { label: status, color: "gray" };
};

export const formatRouteStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    planned: { label: "Direncanakan", color: "gray" },
    in_progress: { label: "Sedang Berjalan", color: "blue" },
    completed: { label: "Selesai", color: "green" },
    cancelled: { label: "Dibatalkan", color: "red" },
  };
  
  return statusMap[status] || { label: status, color: "gray" };
};

export const formatVehicleStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    available: { label: "Tersedia", color: "green" },
    in_use: { label: "Sedang Digunakan", color: "blue" },
    maintenance: { label: "Perawatan", color: "yellow" },
    retired: { label: "Tidak Aktif", color: "gray" },
  };
  
  return statusMap[status] || { label: status, color: "gray" };
};

export const formatDriverStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    active: { label: "Aktif", color: "green" },
    inactive: { label: "Tidak Aktif", color: "gray" },
    on_leave: { label: "Cuti", color: "yellow" },
    terminated: { label: "Dihentikan", color: "red" },
  };
  
  return statusMap[status] || { label: status, color: "gray" };
};

export const formatPODStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    pending: { label: "Menunggu", color: "gray" },
    captured: { label: "Tertangkap", color: "blue" },
    verified: { label: "Terverifikasi", color: "green" },
    rejected: { label: "Ditolak", color: "red" },
  };
  
  return statusMap[status] || { label: status, color: "gray" };
};

// ============= RESPONSE FORMATTER =============
export const formatResponse = <T>(
  data: T,
  message: string = "Success"
): { success: boolean; data: T; message: string } => {
  return {
    success: true,
    data,
    message,
  };
};

export const formatError = (error: any): { success: boolean; error: string } => {
  const message =
    error?.response?.data?.detail ||
    error?.message ||
    "An error occurred";

  return {
    success: false,
    error: message,
  };
};
