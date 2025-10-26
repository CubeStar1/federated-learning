import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

export const NetworkEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path stroke-primary/30"
        d={edgePath}
        markerEnd={markerEnd}
        strokeWidth={2}
      />
    </>
  );
});

NetworkEdge.displayName = 'NetworkEdge';
