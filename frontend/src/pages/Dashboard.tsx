import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, AlertCircle, Database, TrendingUp, AlertTriangle, MessageSquareWarning, DollarSign, Activity, CheckCircle2 } from 'lucide-react';
import PipelineGraph from '../components/PipelineGraph';
import DemoSimulator from '../components/DemoSimulator';

// Helper to generate dynamic mock data based on state
const generateData = (state: 'healthy' | 'failure' | 'resolving') => {
  const base = [
    { name: 'Sep 10', expected: 4100 },
    { name: 'Sep 11', expected: 3800 },
    { name: 'Sep 12', expected: 4000 },
    { name: 'Sep 13', expected: 4200 },
    { name: 'Sep 14', expected: 4100 },
    { name: 'Sep 15', expected: 4300 },
    { name: 'Sep 16', expected: 4100 },
  ];

  if (state === 'healthy') {
    return base.map(d => ({ ...d, revenue: d.expected + (Math.random() * 400 - 200) }));
  } else if (state === 'failure') {
    return base.map((d, i) => ({ 
      ...d, 
      revenue: i >= 3 ? d.expected * 0.77 : d.expected + (Math.random() * 400 - 200) 
    }));
  } else {
    // resolving
    return base.map((d, i) => ({ 
      ...d, 
      revenue: i >= 5 ? d.expected + (Math.random() * 400 - 200) : (i >= 3 ? d.expected * 0.77 : d.expected + (Math.random() * 400 - 200)) 
    }));
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const [simulationState, setSimulationState] = useState<'healthy' | 'failure' | 'resolving'>('healthy');
  const [chartData, setChartData] = useState(() => generateData('healthy'));

  useEffect(() => {
    setChartData(generateData(simulationState));
  }, [simulationState]);

  return (
    <>
      <motion.div className="space-y-6 pb-24" variants={containerVariants} initial="hidden" animate="show">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Diagnosis Overview</h2>
            <p className="text-slate-400">AI monitoring your data pipelines in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-surface border border-slate-700 text-sm font-medium">
              Export Report
            </button>
          </div>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="glass-panel p-6">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-blue-400/10"><Database className="w-6 h-6 text-blue-400" /></div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">Healthy</span>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Data Sources</h3>
              <p className="text-3xl font-bold text-white mt-1">12</p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className={`glass-panel p-6 transition-colors ${simulationState === 'failure' ? 'border-rose-500/50 bg-rose-500/5' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-amber-400/10"><AlertTriangle className={`w-6 h-6 ${simulationState === 'failure' ? 'text-rose-400' : 'text-amber-400'}`} /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Open Anomalies</h3>
              <p className="text-3xl font-bold text-white mt-1">{simulationState === 'failure' ? '1' : '0'}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-emerald-400/10"><Brain className="w-6 h-6 text-emerald-400" /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">AI Resolved</h3>
              <p className="text-3xl font-bold text-white mt-1">18</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16" /></div>
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-rose-400/10"><Activity className="w-6 h-6 text-rose-400" /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-medium">Est. Financial Impact</h3>
              <p className={`text-3xl font-bold mt-1 ${simulationState === 'failure' ? 'text-rose-400' : 'text-slate-400'}`}>
                {simulationState === 'failure' ? '-$14,200' : '$0'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Dashboard Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Charts Area */}
          <motion.div variants={itemVariants} className="xl:col-span-2 space-y-6">
            <div className="glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Revenue Anomaly (orders.csv)</h3>
                {simulationState === 'failure' && (
                  <span className="px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full animate-pulse">
                    CRITICAL
                  </span>
                )}
              </div>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={simulationState === 'failure' ? '#ef4444' : '#10b981'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={simulationState === 'failure' ? '#ef4444' : '#10b981'} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="expected" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" name="Expected" />
                    <Area type="monotone" dataKey="revenue" stroke={simulationState === 'failure' ? '#ef4444' : '#10b981'} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Knowledge Graph Area */}
            <div className="glass-panel p-6 h-[350px] flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Pipeline Knowledge Graph</h3>
              <div className="flex-1 rounded-lg border border-slate-700/50 overflow-hidden">
                <PipelineGraph simulationState={simulationState} />
              </div>
            </div>
          </motion.div>

          {/* AI Collaboration Sidebar */}
          <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col bg-gradient-to-br from-surface to-surface/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Diagnosis</h3>
            </div>
            
            <AnimatePresence mode="wait">
              {simulationState === 'healthy' && (
                <motion.div 
                  key="healthy"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-4"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
                  <p>All pipelines are operating normally.</p>
                </motion.div>
              )}

              {simulationState === 'failure' && (
                <motion.div 
                  key="failure"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 flex-1"
                >
                  <p className="text-slate-300 text-sm leading-relaxed">
                    DataDoctor detected a <strong className="text-rose-400">23% decline</strong> in revenue. 
                  </p>
                  
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300">Root Cause Confidence</span>
                      <span className="text-sm font-bold text-amber-400">87%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      Primary candidate: <strong className="text-slate-200">Pipeline Failure</strong>
                    </p>
                    <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
                      <li>Ingestion node interrupted.</li>
                      <li>Missing records spiked 18%.</li>
                    </ul>
                  </div>

                  {/* Slack Simulation UI */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-xl relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                        <MessageSquareWarning className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">DataDoctor Bot</span>
                      <span className="text-xs text-slate-500">12:43 PM</span>
                    </div>
                    <p className="text-sm text-slate-200 mb-4">
                      I am unable to confidently resolve this autonomously. <br/><br/>
                      <strong>Question:</strong> Was there a planned database migration between Sep 11–13?
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSimulationState('resolving')}
                        className="flex-1 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded transition-all"
                      >
                        Yes, planned
                      </button>
                      <button className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded transition-all">
                        No
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {simulationState === 'resolving' && (
                <motion.div 
                  key="resolving"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-4"
                >
                  <Brain className="w-12 h-12 text-primary" />
                  <div className="text-center">
                    <p className="text-emerald-400 font-semibold mb-2">Diagnosis Updated!</p>
                    <p className="text-sm">Root cause confirmed via Human Input. Confidence increased to 98%.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Simulation Controls Footer */}
      <DemoSimulator 
        simulationState={simulationState} 
        setSimulationState={setSimulationState}
        onReset={() => setSimulationState('healthy')} 
      />
    </>
  );
};

export default Dashboard;
