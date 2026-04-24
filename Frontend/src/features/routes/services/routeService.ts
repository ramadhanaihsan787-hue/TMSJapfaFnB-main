import { api } from "shared/services/apiClient";

export const routeService = {
  // 1. GET ROUTES
  fetchRoutes: async (date: string) => {
    const res = await api.get(`/api/routes?date=${date}`);
    return res.data;
  },

  // 2. UPLOAD EXCEL
  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/api/orders/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  // 3. UPDATE TIME
  updateTimeWindow: async (orderId: string, newTime: string) => {
    const res = await api.put(`/api/orders/${orderId}/time`, {
      jam_maksimal: newTime,
    });

    return res.data;
  },

  // 4. SAVE COORDINATE
  saveCoordinate: async (
    idx: number,           // 🌟 ERROR 'ANY' MUSNAH!
    customerCode: string,  // 🌟 CAMELCASE SESUAI USEUPLOAD.TS
    storeName: string,     // 🌟 CAMELCASE SESUAI USEUPLOAD.TS
    lat: number,
    lon: number
  ) => {
    // Mapping dari camelCase Frontend ke snake_case Backend
    const payload = {
      latitude: lat,
      longitude: lon,
      kode_customer: customerCode,
      nama_customer: storeName,
    };

    const res = await api.put(`/api/orders/DRAFT-${idx}/coordinate`, payload);

    return res.data;
  },

  // 5. OPTIMIZE ROUTE
  optimizeRoute: async () => {
    const res = await api.post(`/api/routes/optimize?preview=true`);
    return res.data;
  },

  // 6. CONFIRM ROUTE
  confirmRoute: async (previewData: any) => {
    const res = await api.post(`/api/routes/confirm`, previewData);
    return res.data;
  },
};