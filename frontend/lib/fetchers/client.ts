import { clientRequest } from "./http";
import {
  ClientHealthResponse,
  StopResponse,
  SupernodeStartPayload,
  SupernodeStartResponse,
} from "./types";

export const fetchClientHealth = async (): Promise<ClientHealthResponse> =>
  clientRequest<ClientHealthResponse>({ method: "GET", url: "/health" });

export const startSupernode = async (
  payload: SupernodeStartPayload
): Promise<SupernodeStartResponse> =>
  clientRequest<SupernodeStartResponse>({
    method: "POST",
    url: "/supernode/start",
    data: payload,
  });

export const stopSupernode = async (): Promise<StopResponse> =>
  clientRequest<StopResponse>({ method: "POST", url: "/supernode/stop" });
