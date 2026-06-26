import { apiGet, apiPost, apiPut } from "@/lib/api/client";

export const notificationService = {
  getByUser: (userId: number) =>
    apiGet(`/notifications/user/${userId}`),

  markRead: (id: number) =>
    apiPut(`/notifications/${id}/read`, { unread: false }),

  markBulkRead: (ids: number[]) =>
    apiPost("/notifications/mark-bulk-read", { ids }),

  create: (payload: {
    title: string;
    description: string;
    type: string;
    notification_type: string;
    roleId: string;
    userId: string;
  }) => apiPost("/notifications", payload),
};
