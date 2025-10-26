'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Node as NodeType, NodeSession } from '@/lib/fetchers/types';
import { NetworkNode } from './custom-nodes';
import { NetworkEdge } from './custom-edges';

interface TopologyViewerProps {
  coordinator: {
    session: NodeSession;
    node: NodeType;
  } | null;
  participants: Array<{
    session: NodeSession;
    node: NodeType;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'running':
      return '#10b981';
    case 'completed':
      return '#3b82f6';
    case 'failed':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

function TopologyViewerFlow({ coordinator, participants }: TopologyViewerProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    if (!coordinator && participants.length === 0) {
      return { nodes: flowNodes, edges: flowEdges };
    }

    const centerX = 500;
    const centerY = 300;

    if (coordinator) {
      flowNodes.push({
        id: coordinator.session.id,
        type: 'networkNode',
        data: {
          label: coordinator.node.display_name || 'Coordinator',
          externalId: coordinator.node.external_id,
          role: 'coordinator',
          status: coordinator.session.status,
          statusColor: getStatusColor(coordinator.session.status),
        },
        position: { x: centerX, y: centerY },
        draggable: false,
      });

      if (participants.length > 0) {
        const radius = Math.max(300, 150 + participants.length * 30);
        const angleStep = (2 * Math.PI) / participants.length;

        participants.forEach(({ session, node }, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          flowNodes.push({
            id: session.id,
            type: 'networkNode',
            data: {
              label: node.display_name || node.external_id.substring(0, 12),
              externalId: node.external_id,
              role: 'participant',
              status: session.status,
              statusColor: getStatusColor(session.status),
            },
            position: { x, y },
            draggable: false,
          });

          flowEdges.push({
            id: `${coordinator.session.id}-${session.id}`,
            source: coordinator.session.id,
            target: session.id,
            type: 'networkEdge',
            animated: true,
          });
        });
      }
    } else if (participants.length > 0) {
      participants.forEach(({ session, node }, index) => {
        flowNodes.push({
          id: session.id,
          type: 'networkNode',
          data: {
            label: node.display_name || node.external_id.substring(0, 12),
            externalId: node.external_id,
            role: 'participant',
            status: session.status,
            statusColor: getStatusColor(session.status),
          },
          position: { x: 200 + index * 200, y: centerY },
          draggable: false,
        });
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [coordinator, participants]);

  const nodeTypes = useMemo(() => ({ networkNode: NetworkNode }), []);
  const edgeTypes = useMemo(() => ({ networkEdge: NetworkEdge }), []);

  if (nodes.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
        No topology data available
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        preventScrolling={false}
      >
        <Controls showInteractive={false} />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export function TopologyViewer({ coordinator, participants }: TopologyViewerProps) {
  return (
    <ReactFlowProvider>
      <TopologyViewerFlow coordinator={coordinator} participants={participants} />
    </ReactFlowProvider>
  );
}
