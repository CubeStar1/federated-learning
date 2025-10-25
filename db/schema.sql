CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects represent a single federated deployment (one per coordinator)
CREATE TABLE projects (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	slug TEXT UNIQUE NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	config JSONB DEFAULT '{}'::JSONB,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nodes represent coordinator/participant endpoints
CREATE TABLE nodes (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	external_id TEXT UNIQUE NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('coordinator', 'participant')),
	display_name TEXT,
	metadata JSONB DEFAULT '{}'::JSONB,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runtime sessions created when a node process starts (superlink/supernode)
CREATE TABLE node_sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
	status TEXT NOT NULL DEFAULT 'starting',
	pid INTEGER,
	started_at TIMESTAMPTZ DEFAULT NOW(),
	ended_at TIMESTAMPTZ,
	runtime_config JSONB DEFAULT '{}'::JSONB,
	log_stream TEXT DEFAULT '',
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE federated_runs (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	status TEXT NOT NULL,
	label TEXT,
	config JSONB DEFAULT '{}'::JSONB,
	coordinator_session_id UUID REFERENCES node_sessions(id) ON DELETE SET NULL,
	started_at TIMESTAMPTZ DEFAULT NOW(),
	ended_at TIMESTAMPTZ,
	log_stream TEXT DEFAULT '',
	metrics JSONB DEFAULT '{}'::JSONB
);

ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE node_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE federated_runs;

CREATE INDEX idx_nodes_project_role ON nodes(project_id, role);
CREATE INDEX idx_sessions_node ON node_sessions(node_id);
CREATE INDEX idx_sessions_status ON node_sessions(status);
CREATE INDEX idx_runs_project_status ON federated_runs(project_id, status);
