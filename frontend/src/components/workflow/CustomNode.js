import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Settings, Filter, ArrowRightLeft, Clock, CheckCircle } from 'lucide-react';
import './WorkflowNodes.css';

const iconMap = {
  Trigger: <Play size={16} />,
  Action: <Settings size={16} />,
  Filter: <Filter size={16} />,
  Condition: <ArrowRightLeft size={16} />,
  Delay: <Clock size={16} />,
  End: <CheckCircle size={16} />
};

export const CustomNode = memo(({ data, isConnectable }) => {
  return (
    <div className={`workflow-node ${data.type.toLowerCase()}`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      
      <div className="node-header">
        <div className="node-icon">{iconMap[data.type]}</div>
        <div className="node-title">{data.label}</div>
      </div>
      
      <div className="node-content">
        <span className="node-type-label">{data.type}</span>
        {data.description && <p className="node-desc">{data.description}</p>}
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
});
