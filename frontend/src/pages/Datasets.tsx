import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Database, UploadCloud, FileText, CheckCircle2, AlertTriangle, MoreVertical, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatRows = (rows: number) => {
  if (rows > 1000000) return (rows / 1000000).toFixed(1) + 'M';
  if (rows > 1000) return (rows / 1000).toFixed(1) + 'K';
  return rows.toString();
};

const Datasets = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingToApi, setIsUploadingToApi] = useState(false);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/datasets/');
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      setDatasets(data);
      setError(null);
    } catch (err: any) {
      setError('Could not connect to DataDoctor Backend API. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingToApi(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Upload failed');
      }

      // Success
      await fetchDatasets();
      setIsUploading(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingToApi(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <motion.div className="space-y-6 max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="show">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Datasets</h2>
          <p className="text-slate-400">Manage and profile your ingested data sources.</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/20 transition-all font-medium text-sm"
        >
          <UploadCloud className="w-4 h-4" /> Upload Dataset
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isUploading && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="glass-panel p-8 mb-6 border-dashed border-2 border-primary/30 flex flex-col items-center justify-center text-center relative"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
            accept=".csv,.json,.xlsx"
          />
          
          {isUploadingToApi ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Analyzing Data Pipeline...</h3>
              <p className="text-slate-400 text-sm">DataDoctor is parsing rows, generating schemas, and looking for anomalies.</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Data Source</h3>
              <p className="text-slate-400 text-sm mb-6">Supports CSV, JSON, and XLSX. The backend Pandas engine will parse it automatically.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Files
                </button>
                <button 
                  onClick={() => setIsUploading(false)} 
                  className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No datasets found in the database. Upload one to get started!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dataset Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rows / Cols</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {datasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-white">{dataset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <span className="font-medium">{formatRows(dataset.row_count)}</span> rows <span className="text-slate-500">×</span> {dataset.column_count} cols
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(dataset.uploaded_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Datasets;
