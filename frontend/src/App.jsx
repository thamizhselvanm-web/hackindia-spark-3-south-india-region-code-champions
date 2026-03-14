import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LeadDiscoveryPage from './pages/LeadDiscoveryPage';
import CampaignDispatchPage from './pages/CampaignDispatchPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import AssistantWidget from './components/AssistantWidget';
import GlitchLoader from './components/GlitchLoader';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if it's the first visit in this session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasVisited', 'true');
    setLoading(false);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <AnimatePresence>
          {loading && <GlitchLoader onComplete={handleLoadingComplete} />}
        </AnimatePresence>
        
        {/* Global ambient background glow for all pages */}
        <div className="hero-glow"></div>
        
        <Navbar />
        
        <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadDiscoveryPage />} />
            <Route path="/dispatch" element={<CampaignDispatchPage />} />
          </Routes>
        </main>
        
        {/* Global 3D Assistant Widget */}
        <AssistantWidget />
      </div>
    </Router>
  );
}

export default App;
