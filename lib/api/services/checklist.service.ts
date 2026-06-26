import { AxiosError } from "axios";
import { api, apiGet, apiPost } from "@/lib/api/client";

export const checklistService = {
  getList: (params: Record<string, unknown>) =>
    apiGet("/checklist", params),

  getHistory: (id: number, params?: Record<string, unknown>) =>
    apiGet(`/checklist/history/${id}`, params),

  getTodayLatest: async (stasiunId: number) => {
    try {
      return await apiGet(`/checklist/today-latest/${stasiunId}`);
    } catch (error) {
      // Belum ada checklist hari ini — normal, bukan error fatal
      if ((error as AxiosError).response?.status === 404) return null;
      throw error;
    }
  },

  getBulk: (params: Record<string, unknown>) =>
    apiGet("/checklist/bulk", params),

  getItems: (stasiunId: number) =>
    apiGet(`/stasiun-items/checklist/${stasiunId}`),

  getPic: () => apiGet("/pic"),

  getTopProblems: (stasiunId: number) =>
    apiGet("/checklist/top-5-problems", { stasiun_id: stasiunId }),

  create: (payload: unknown) => apiPost("/checklist/create", payload),

  createWithFiles: async (payload: {
    stasiun_id: number;
    user_id: number;
    checklist_items: Array<{
      item_id: number;
      condition: boolean;
      comment: string;
      photo?: string | File;
    }>;
  }) => {
    const formData = new FormData();
    formData.append("stasiun_id", String(payload.stasiun_id));
    formData.append("user_id", String(payload.user_id));

    const itemsJson = payload.checklist_items.map((item) => ({
      item_id: item.item_id,
      condition: item.condition,
      comment: item.comment,
      photo:
        item.photo instanceof File
          ? item.photo.name
          : item.photo
            ? String(item.photo).split("/").pop()
            : null,
    }));
    formData.append("checklist_items", JSON.stringify(itemsJson));

    payload.checklist_items.forEach((item) => {
      if (item.photo instanceof File) {
        formData.append("photos", item.photo);
      }
    });

    const { data } = await api.post("/checklist/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
