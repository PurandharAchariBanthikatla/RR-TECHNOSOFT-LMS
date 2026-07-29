import { apiClient } from "./client";
import { API_ROUTES } from "@/lib/constants";
import { Paginated, PlacementDrive } from "@/types";

export const placementsApi = {
  list: (params?: { page?: number; size?: number; status?: string }) =>
    apiClient.get<Paginated<PlacementDrive>>(API_ROUTES.placements, { params }).then((r) => r.data),

  get: (id: string) => apiClient.get<PlacementDrive>(`${API_ROUTES.placements}/${id}`).then((r) => r.data),

  create: (payload: Partial<PlacementDrive>) =>
    apiClient.post<PlacementDrive>(API_ROUTES.placements, payload).then((r) => r.data),

  apply: (id: string) => apiClient.post(`${API_ROUTES.placements}/${id}/apply`).then((r) => r.data),
};
