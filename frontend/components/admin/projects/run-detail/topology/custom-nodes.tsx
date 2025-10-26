import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Server, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const NetworkNode = memo(({ data }: NodeProps) => {
  const isCoordinator = data.role === 'coordinator';
  const statusColor = data.statusColor || '#6b7280';

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      
      <div
        className="px-4 py-3 rounded-lg border-2 bg-card shadow-lg transition-all hover:shadow-xl"
        style={{
          borderColor: statusColor,
          minWidth: isCoordinator ? '140px' : '120px',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            {isCoordinator ? (
              <Server className="w-6 h-6" style={{ color: statusColor }} />
            ) : (
              <Users className="w-6 h-6" style={{ color: statusColor }} />
            )}
          </div>
          
          <div className="text-center">
            <div className="text-xs font-semibold text-foreground truncate max-w-[100px]">
              {data.label}
            </div>
            {data.externalId && (
              <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                {data.externalId}
              </div>
            )}
          </div>

          {data.status && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{
                borderColor: statusColor,
                color: statusColor,
                backgroundColor: `${statusColor}10`,
              }}
            >
              {data.status}
            </Badge>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
});

NetworkNode.displayName = 'NetworkNode';
