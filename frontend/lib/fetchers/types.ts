export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  config: Json | null;
  created_at: string;
  updated_at: string;
}

export type NodeRole = "coordinator" | "participant" | string;

export interface Node {
  id: string;
  project_id: string;
  external_id: string;
  role: NodeRole;
  display_name: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface NodeSession {
  id: string;
  node_id: string;
  status: string;
  pid: number | null;
  started_at: string | null;
  ended_at: string | null;
  runtime_config: Json | null;
  log_stream: string | null;
  created_at: string;
}

export interface FederatedRun {
  id: string;
  project_id: string;
  status: string;
  label: string | null;
  config: Json | null;
  coordinator_session_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  log_stream: string | null;
  metrics: Json | null;
}

export interface AdminHealthResponse {
  superlink_running: boolean;
  run_active: boolean;
  superlink_started_at: string | null;
  run_info: RunInfo | null;
  project_id: string | null;
}

export interface RunInfo {
  federation_name: string;
  started_at: string;
  pid: string;
  log_path: string;
  run_id: string;
}

export interface SuperlinkStartPayload {
  insecure?: boolean;
  certificates_path?: string | null;
  listen_address?: string | null;
  extra_args?: string[];
}

export interface ClientHealthResponse {
  supernode_running: boolean;
  started_at: string | null;
  log_path: string | null;
  session_id: string | null;
  project_id: string | null;
}

export interface SupernodeStartPayload {
  superlink_address: string;
  partition_id: number;
  num_partitions: number;
  clientappio_api_address?: string;
  insecure?: boolean;
  certificates_path?: string | null;
  extra_args?: string[];
}

export interface RunStartPayload {
  federation_name?: string;
  stream?: boolean;
  extra_args?: string[];
}

export interface NodeWithSessions {
  node: Node;
  sessions: NodeSession[];
}

export interface SuperlinkStartResponse {
  status: string;
  pid?: string;
  log_path?: string;
  session_id?: string;
}

export interface RunStartResponse {
  status: string;
  pid?: string;
  log_path?: string;
  run_id?: string;
  session_id?: string;
}

export interface SupernodeStartResponse {
  status: string;
  pid?: string;
  log_path?: string;
  session_id?: string;
}

export interface StopResponse {
  status: string;
}

export interface ProjectSummary {
  project: Project;
  nodeCount: number;
  coordinatorCount: number;
  participantCount: number;
  activeRunCount: number;
  latestRun: FederatedRun | null;
}

export interface DashboardData {
  project: Project | null;
  nodes: Node[];
  nodeSessions: NodeSession[];
  activeRun: FederatedRun | null;
  recentRuns: FederatedRun[];
}

export interface ProjectDetailStats {
  nodeCount: number;
  coordinatorCount: number;
  participantCount: number;
  activeRun: FederatedRun | null;
  latestRun: FederatedRun | null;
}

export interface ProjectDetailResponse {
  project: Project;
  stats: ProjectDetailStats;
}

export interface ProjectNodesResponse {
  nodes: Node[];
  sessions: NodeSession[];
}

export interface ProjectRunsResponse {
  runs: FederatedRun[];
}

export interface RunDetailResponse {
  run: FederatedRun;
  coordinatorSession: NodeSession | null;
}
