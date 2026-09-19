import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Database, LayoutDashboard, MessageSquareWarning, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'Anomalies', path: '/anomalies', icon: Activity },
    { name: 'AI Collab', path: '/collaborate', icon: MessageSquareWarning },
  ];

  return (
    <div className="w-64 h-full border-r border-slate-800 bg-surface/50 backdrop-blur-xl flex flex-col pt-8">
      <div className="px-6 mb-12 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
          DataDoctor
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-slate-800/80 border border-slate-700/50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <link.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary' : ''}`} />
              <span className="relative z-10">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors w-full">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
