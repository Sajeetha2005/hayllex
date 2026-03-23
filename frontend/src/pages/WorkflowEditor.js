import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomNode } from '../components/workflow/CustomNode';
import StepConfigPanel from '../components/workflow/StepConfigPanel';
import './WorkflowEditor.css';
import { Play, Save, ArrowLeft, Plus, Settings, Filter, ArrowRightLeft, Clock, CheckCircle } from 'lucide-react';

const nodeTypes = { custom: CustomNode };
const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/workflows`;

let id = 0;
const getId = () => `node-${id++}`;

const WorkflowEditor = () => {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [rulesMap, setRulesMap] = useState({}); // nodeId -> array of rules
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchWorkflowDetails();
  }, [workflowId]);

  const fetchWorkflowDetails = async () => {
    try {
      const res = await axios.get(`${API}/${workflowId}`);
      setWorkflow(res.data.workflow);
      
      const { steps, rules } = res.data;
      
      // Reconstruct nodes
      const loadedNodes = steps.map(s => ({
        id: s._id,
        type: 'custom',
        position: { x: s.position.x, y: s.position.y },
        data: { 
          label: s.name, 
          type: s.type, 
          description: s.config?.description || "",
          config: s.config
        }
      }));
      setNodes(loadedNodes);

      // Reconstruct edges (nextSteps)
      const loadedEdges = [];
      steps.forEach(s => {
        if(s.nextSteps && s.nextSteps.length > 0) {
          s.nextSteps.forEach(nId => {
            loadedEdges.push({
              id: `e-${s._id}-${nId}`,
              source: s._id,
              target: nId,
              animated: true
            });
          });
        }
      });
      setEdges(loadedEdges);

      // Reconstruct rules map
      const rMap = {};
      rules.forEach(r => {
        if(!rMap[r.stepId]) rMap[r.stepId] = [];
        rMap[r.stepId].push(r);
      });
      setRulesMap(rMap);
      
      if(steps.length > 0){
        id = Math.max(...steps.map(s => parseInt(s._id.replace('node-','')) || 0)) + 1000;
      }
    } catch(err) {
      console.error(err);
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = getId();
      const newNode = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { label: `New ${type}`, type: type, config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
      setRulesMap(prev => ({ ...prev, [newNodeId]: [] })); // init empty rules
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleSaveNodeConfig = (nodeId, config) => {
    setNodes(nds => nds.map(n => {
      if(n.id === nodeId) {
        return {
          ...n,
          data: { ...n.data, label: config.label || n.data.label, type: config.type || n.data.type, config, description: config.description }
        };
      }
      return n;
    }));
  };

  const handleSaveNodeRules = (nodeId, localRules) => {
    setRulesMap(prev => ({ ...prev, [nodeId]: localRules }));
  };

  const onSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      // Build steps array
      const steps = nodes.map(n => {
        // Find outgoing edges to build nextSteps array
        const outEdges = edges.filter(e => e.source === n.id);
        const nextSteps = outEdges.map(e => e.target);
        
        return {
          id: n.id, // temp id if new, objectId if existing
          name: n.data.label,
          type: n.data.type,
          config: n.data.config,
          position: n.position,
          nextSteps
        };
      });

      // Flatten rules array
      const flatRules = [];
      Object.keys(rulesMap).forEach(k => {
        flatRules.push(...rulesMap[k]);
      });

      await axios.put(`${API}/${workflowId}/state`, { steps, rules: flatRules });
      await fetchWorkflowDetails(); 
    } catch(err) {
      console.error(err);
      alert("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  const onExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await axios.post(`${API}/${workflowId}/execute`, {});
      alert(`Execution started! Log ID: ${res.data.logId}`);
    } catch(err) {
      alert("Execution failed to start");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="workflow-editor-wrapper">
      <div className="editor-topbar">
        <div className="flex-row">
          <button className="icon-btn" onClick={() => navigate('/workflows')}><ArrowLeft size={18} /></button>
          <h2>{workflow?.name || "Loading..."}</h2>
        </div>
        <div className="flex-row gap-2">
          <button className="btn btn-secondary" onClick={onSaveWorkflow} disabled={isSaving}>
            <Save size={16} style={{marginRight: 6}} />
            {isSaving ? "Saving..." : "Save Workflow"}
          </button>
          <button className="btn btn-primary btn-execute" onClick={onExecute} disabled={isExecuting}>
            <Play size={16} style={{marginRight: 6}} />
            Execute Test
          </button>
        </div>
      </div>

      <div className="editor-main">
        {/* Node Palette */}
        <div className="node-palette">
          <h4 className="palette-title">Nodes</h4>
          <p className="palette-desc">Drag nodes onto the canvas</p>
          
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Trigger')} draggable>
            <div className="node-icon trigger"><Play size={14}/></div> Trigger
          </div>
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Action')} draggable>
            <div className="node-icon action"><Settings size={14}/></div> Action
          </div>
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Filter')} draggable>
            <div className="node-icon filter"><Filter size={14}/></div> Filter
          </div>
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Condition')} draggable>
            <div className="node-icon condition"><ArrowRightLeft size={14}/></div> Condition
          </div>
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'Delay')} draggable>
            <div className="node-icon delay"><Clock size={14}/></div> Delay
          </div>
          <div className="palette-item" onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'End')} draggable>
            <div className="node-icon end"><CheckCircle size={14}/></div> End
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-container" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              className="dark-theme-flow"
            >
              <Background color="#3a3f60" gap={20} size={1} />
              <Controls className="custom-controls" showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Configuration side panel */}
        {selectedNode && (
          <StepConfigPanel 
            node={selectedNode}
            rules={rulesMap[selectedNode.id]}
            onSaveNode={handleSaveNodeConfig}
            onSaveRules={handleSaveNodeRules}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowEditor;
