import { apiRequest } from "./http";
import {
  CreateProjectPayload,
  CreateProjectResponse,
  DashboardData,
  JoinProjectPayload,
  JoinProjectResponse,
  ProjectDetailResponse,
  ProjectNodesResponse,
  ProjectRunsResponse,
  ProjectSummary,
  RunDetailResponse,
} from "./types";

export const fetchProjects = async (): Promise<ProjectSummary[]> =>
  apiRequest<ProjectSummary[]>({ method: "GET", url: "/admin/projects" });

export const fetchProject = async (
  projectId: string
): Promise<ProjectDetailResponse> =>
  apiRequest<ProjectDetailResponse>({
    method: "GET",
    url: `/admin/projects/${projectId}`,
  });

export const fetchProjectNodes = async (projectId: string) =>
  apiRequest<ProjectNodesResponse>({
    method: "GET",
    url: `/admin/projects/${projectId}/nodes`,
  });

export const fetchProjectRuns = async (projectId: string) =>
  apiRequest<ProjectRunsResponse>({
    method: "GET",
    url: `/admin/projects/${projectId}/runs`,
  });

export const fetchRunDetail = async (projectId: string, runId: string) =>
  apiRequest<RunDetailResponse>({
    method: "GET",
    url: `/admin/projects/${projectId}/runs/${runId}`,
  });

export const fetchDashboardData = async (
  projectId: string
): Promise<DashboardData> =>
  apiRequest<DashboardData>({
    method: "GET",
    url: `/admin/dashboard`,
    params: { projectId },
  });

export const createProject = async (
  payload: CreateProjectPayload
): Promise<CreateProjectResponse> =>
  apiRequest<CreateProjectResponse>({
    method: "POST",
    url: "/admin/projects",
    data: payload,
  });

export const fetchClientProjects = async (): Promise<ProjectSummary[]> =>
  apiRequest<ProjectSummary[]>({ method: "GET", url: "/client/projects" });

export const fetchClientProject = async (
  projectId: string
): Promise<ProjectDetailResponse> =>
  apiRequest<ProjectDetailResponse>({
    method: "GET",
    url: `/client/projects/${projectId}`,
  });

export const fetchClientDashboardData = async (
  projectId: string
): Promise<DashboardData> =>
  apiRequest<DashboardData>({
    method: "GET",
    url: `/client/dashboard`,
    params: { projectId },
  });

export const joinClientProject = async (
  projectId: string,
  payload?: JoinProjectPayload
): Promise<JoinProjectResponse> =>
  apiRequest<JoinProjectResponse>({
    method: "POST",
    url: `/client/projects/${projectId}/join`,
    data: payload ?? {},
  });
