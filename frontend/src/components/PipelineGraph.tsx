import React from 'react';
import { ReactFlow, Background, Controls, MarkerType, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface PipelineGraphProps {
  simulationState: 'healthy' | 'failure' | 'resolving';
}

const PipelineGraph: React.FC<PipelineGraphProps> = ({ simulationState }) => {
  const isFailure = simulationState === 'failure';
  
  const nodes: Node[] = [
    {
      id: 'source',
      position: { x: 50, y: 150 },
      data: { label: 'Postgres (Source)' },
      style: {
        background: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: '8px',
        width: 140,
      }
    },
    {
      id: 'ingestion',
      position: { x: 250, y: 150 },
      data: { label: 'Ingestion Job' },
      style: {
        background: isFailure ? '#ef4444' : '#3b82f6',
        color: '#fff',
        border: isFailure ? '1px solid #f87171' : '1px solid #60a5fa',
        borderRadius: '8px',
        width: 140,
        boxShadow: isFailure ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none',
        transition: 'all 0.3s ease'
      }
    },
    {
      id: 'warehouse',
      position: { x: 450, y: 150 },
      data: { label: 'Data Warehouse' },
      style: {
        background: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: '8px',
        width: 140,
      }
    },
    {
      id: 'dashboard',
      position: { x: 650, y: 150 },
      data: { label: 'Marketing Dash' },
      style: {
        background: '#1e293b',
        color: '#e2e8f0',
        border: isFailure ? '1px solid #ef4444' : '1px solid #334155',
        borderRadius: '8px',
        width: 140,
      }
    }
  ];

  const edges: Edge[] = [
    {
      id: 'e-source-ingest',
      source: 'source',
      target: 'ingestion',
      animated: !isFailure,
      style: { stroke: isFailure ? '#ef4444' : '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isFailure ? '#ef4444' : '#64748b' }
    },
    {
      id: 'e-ingest-warehouse',
      source: 'ingestion',
      target: 'warehouse',
      animated: !isFailure,
      style: { stroke: isFailure ? '#ef4444' : '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isFailure ? '#ef4444' : '#64748b' }
    },
    {
      id: 'e-warehouse-dash',
      source: 'warehouse',
      target: 'dashboard',
      animated: !isFailure,
      style: { stroke: isFailure ? '#ef4444' : '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isFailure ? '#ef4444' : '#64748b' }
    }
  ];

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-slate-900/50">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#334155" gap={16} />
        <Controls className="bg-surface border-slate-700" showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default PipelineGraph;
