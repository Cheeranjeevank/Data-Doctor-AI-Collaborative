import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Activity, ArrowRight, Brain, RefreshCw, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: 'border-l-rose-500 bg-rose-500/5',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-emerald-500',
};

const SEVERITY_ICON_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-500/10 text-rose-400',
  MEDIUM: 'bg-amber-500/10 text-amber-400',
  LOW: 'bg-emerald-500/10 text-emerald-400',
};

const TYPE_LABELS: Record<string, string> = {
  MISSING_DATA: 'Missing Data',
  OUTLIER: 'Z-Score Outlier',
  IQR_OUTLIER: 'IQR Outlier',
};

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/anomalies/');
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      const data = await response.json();
      setAnomalies(data);
      setError(null);
    } catch (err: any) {
      setError('Could not connect to DataDoctor API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/anomalies/${id}/resolve`, { method: 'PATCH' });
      setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const open = anomalies.filter(a => a.status !== 'RESOLVED');
  const resolved = anomalies.filter(a => a.status === 'RESOLVED');

  return (
    <motion.div className="space-y-6 max-w-5xl mx-auto" variants={containerVariants} initial="hidden" animate="show">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Anomaly Triage Inbox</h2>
          <p className="text-slate-400">Real anomalies detected by DataDoctor's statistical engines.</p>
        </div>
        <button onClick={fetchAnomalies} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>DataDoctor is scanning for anomalies...</p>
        </div>
      ) : open.length === 0 && resolved.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No anomalies detected yet. Upload a dataset to run the analysis!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {open.length > 0 && (
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
              Open Anomalies ({open.length})
            </h3>
          )}
          {open.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              variants={itemVariants}
              className={`glass-panel p-5 flex items-center justify-between group cursor-pointer transition-all hover:bg-slate-800/50 border-l-4 ${SEVERITY_STYLES[anomaly.severity] || ''}`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-3 rounded-xl ${SEVERITY_ICON_STYLES[anomaly.severity] || ''}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-white">ANM-{anomaly.id.toString().padStart(3, '0')}</span>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">{anomaly.dataset_name}</span>
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{TYPE_LABELS[anomaly.anomaly_type] || anomaly.anomaly_type}</span>
                  </div>
                  <p className="text-slate-200 text-sm max-w-xl">{anomaly.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Detected</span>
                  <span className="text-xs text-slate-300">
                    {anomaly.detected_at ? new Date(anomaly.detected_at).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <button
                  onClick={() => handleResolve(anomaly.id)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  Resolve
                </button>
              </div>
            </motion.div>
          ))}

          {resolved.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1 mt-4">Resolved ({resolved.length})</h3>
              {resolved.map((anomaly) => (
                <div key={anomaly.id} className="glass-panel p-4 flex items-center gap-4 opacity-50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-300">{anomaly.dataset_name} → {anomaly.column_name}</span>
                    <span className="text-xs text-slate-500 ml-3">{TYPE_LABELS[anomaly.anomaly_type]}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Anomalies;
