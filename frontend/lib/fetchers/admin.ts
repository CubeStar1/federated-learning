import { adminRequest } from "./http";
import {
  AdminHealthResponse,
  CatalogResponse,
  DatasetUploadResponse,
  RunStartPayload,
  RunStartResponse,
  StopResponse,
  SuperlinkStartPayload,
  SuperlinkStartResponse,
} from "./types";

export const fetchAdminHealth = async (): Promise<AdminHealthResponse> =>
  adminRequest<AdminHealthResponse>({ method: "GET", url: "/health" });

export const startSuperlink = async (
  payload: SuperlinkStartPayload
): Promise<SuperlinkStartResponse> =>
  adminRequest<SuperlinkStartResponse>({
    method: "POST",
    url: "/superlink/start",
    data: payload,
  });

export const stopSuperlink = async (): Promise<StopResponse> =>
  adminRequest<StopResponse>({ method: "POST", url: "/superlink/stop" });

export const startRun = async (
  payload: RunStartPayload
): Promise<RunStartResponse> =>
  adminRequest<RunStartResponse>({
    method: "POST",
    url: "/runs/start",
    data: payload,
  });

export const stopRun = async (): Promise<StopResponse> =>
  adminRequest<StopResponse>({ method: "POST", url: "/runs/stop" });

export const fetchActiveRun = async (): Promise<{ run: AdminHealthResponse["run_info"] }> =>
  adminRequest<{ run: AdminHealthResponse["run_info"] }>({
    method: "GET",
    url: "/runs/active",
  });

export const fetchModelCatalog = async (): Promise<CatalogResponse> =>
  adminRequest<CatalogResponse>({
    method: "GET",
    url: "/catalog",
  });

export const uploadDataset = async (formData: FormData): Promise<DatasetUploadResponse> =>
  adminRequest<DatasetUploadResponse>({
    method: "POST",
    url: "/datasets/upload",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
