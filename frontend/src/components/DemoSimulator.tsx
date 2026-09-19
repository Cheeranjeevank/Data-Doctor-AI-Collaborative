import React from 'react';
import { Play, AlertTriangle, MessageSquare, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoSimulatorProps {
  simulationState: 'healthy' | 'failure' | 'resolving';
  setSimulationState: (state: 'healthy' | 'failure' | 'resolving') => void;
  onReset: () => void;
}

const DemoSimulator: React.FC<DemoSimulatorProps> = ({ simulationState, setSimulationState, onReset }) => {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel px-6 py-4 flex items-center gap-6 z-50 shadow-2xl shadow-primary/10 border-primary/20"
    >
      <div className="flex items-center gap-2 border-r border-slate-700 pr-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Demo Controls</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        
        <button 
          onClick={() => setSimulationState('failure')}
          disabled={simulationState === 'failure'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            simulationState === 'failure' 
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 opacity-50 cursor-not-allowed'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Inject Pipeline Failure
        </button>
      </div>
    </motion.div>
  );
};

export default DemoSimulator;
