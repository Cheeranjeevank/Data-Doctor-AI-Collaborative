import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import Anomalies from './pages/Anomalies';
import Collaborate from './pages/Collaborate';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 overflow-y-auto relative">
          {/* Subtle background glow */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
          
          <main className="relative z-10 p-8 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/anomalies" element={<Anomalies />} />
              <Route path="/collaborate" element={<Collaborate />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
