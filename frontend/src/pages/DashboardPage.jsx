import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, LayoutTemplate, Send, MousePointerClick, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      setCount(Math.floor(percentage * value));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

const dummyChartData = [
  { name: 'Mon', sent: 10, opened: 4 },
  { name: 'Tue', sent: 25, opened: 12 },
  { name: 'Wed', sent: 40, opened: 20 },
  { name: 'Thu', sent: 35, opened: 18 },
  { name: 'Fri', sent: 55, opened: 30 },
  { name: 'Sat', sent: 70, opened: 45 },
  { name: 'Sun', sent: 90, opened: 60 },
];

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalLeads: 0, campaignsGenerated: 0, emailsSent: 0, responseRate: '0%' });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes, chartRes] = await Promise.all([
          axios.get('/api/stats'),
          axios.get('/api/activities'),
          axios.get('/api/chart-data')
        ]);
        
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
        setChartData(chartRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Total Leads Discovered", value: stats.totalLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-400/20" },
    { title: "Campaigns Generated", value: stats.campaignsGenerated, icon: LayoutTemplate, color: "text-purple-400", bg: "bg-purple-400/20" },
    { title: "Emails Sent", value: stats.emailsSent, icon: Send, color: "text-red-400", bg: "bg-red-400/20" },
    { title: "Avg Response Rate", value: parseInt(stats.responseRate), suffix: "%", icon: MousePointerClick, color: "text-green-400", bg: "bg-green-400/20" },
  ];

  // Helper to map icon types to actual components
  const iconMap = {
    Users: Users,
    LayoutTemplate: LayoutTemplate,
    Send: Send,
    Search: Search,
    MousePointerClick: MousePointerClick
  };

  // Helper to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const activityMetaMap = {
    LEAD_ADDED: { color: "text-blue-400", bg: "bg-blue-400/20" },
    WEBSITE_ANALYZED: { color: "text-blue-400", bg: "bg-blue-400/20" },
    CAMPAIGN_GENERATED: { color: "text-purple-400", bg: "bg-purple-400/20" },
    EMAIL_SENT: { color: "text-primary-main", bg: "bg-primary-main/20" }
  };

  return (
    <div className="pb-20 pt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Campaign Overview</h2>
        <p className="text-muted mt-1">Real-time metrics on your AI-driven PR campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-panel p-6 relative overflow-hidden group"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} border border-white/5`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white tabular-nums">
                  {!isLoading ? (
                    <>
                      <AnimatedCounter value={stat.value} duration={1.5} />
                      {stat.suffix && <span className="text-xl ml-1">{stat.suffix}</span>}
                    </>
                  ) : <span className="text-muted text-xl">...</span> }
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6 lg:col-span-2 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Email Outreach Performance</h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-gray-400">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-400">Opened</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            {!isLoading && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748B" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="opened" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorOpened)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted">
                {isLoading ? "Loading data..." : "No data available for the last 7 days"}
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className="glass-panel p-6"
        >
           <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
           <div className="space-y-6">
             {activities.length > 0 ? (
               activities.map((activity, i) => {
                 const Icon = iconMap[activity.iconType] || LayoutTemplate;
                 const meta = activityMetaMap[activity.type] || { color: "text-gray-400", bg: "bg-gray-400/20" };
                 return (
                   <div key={i} className="flex gap-4">
                     <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                       <Icon className={`w-4 h-4 ${meta.color}`} />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white">{activity.text}</p>
                       <p className="text-xs text-muted mt-1">{formatTimeAgo(activity.createdAt)}</p>
                     </div>
                   </div>
                 );
               })
             ) : (
               <div className="py-10 text-center text-muted text-sm italic">
                  No recent activity logged.
               </div>
             )}
           </div>
           
           <button className="w-full mt-8 py-3 bg-surface border border-white/10 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors text-white">
             View All Activity
           </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
