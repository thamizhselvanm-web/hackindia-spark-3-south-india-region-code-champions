import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Target, Mail } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative z-10">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-sm text-gray-400">New AI-Powered PR Automation Platform</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Automate Your <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-start via-primary-main to-primary-end">
            PR Outreach with AI
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Intelligent PR agency platform. Automatically discover companies, analyze websites, generate full ad campaigns, and send personalized outreach in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/leads">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary-gradient text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2 transition-all hover:shadow-[0_0_40px_rgba(147,51,234,0.6)]"
            >
              Start Campaign <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-surface text-white rounded-xl font-bold text-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              View Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Features Showcase */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { icon: Bot, title: "AI Website Analyzer", desc: "Scrapes and understands any company's core business instantly." },
          { icon: Target, title: "Predictive Lead Scoring", desc: "Ranks companies based on market potential and industry matching." },
          { icon: Mail, title: "Automated Outreach", desc: "Generates custom ad creatives and sends personalized emails." },
        ].map((feat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="glass-panel p-6"
          >
            <div className="w-12 h-12 bg-primary-main/20 rounded-xl flex items-center justify-center mb-4 border border-primary-main/30">
              <feat.icon className="w-6 h-6 text-primary-main" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
            <p className="text-gray-400 text-sm">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
