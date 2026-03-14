import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, Inbox, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIThinking from '../components/AIThinking';
import CampaignPreview from '../components/CampaignPreview';

const LeadDiscoveryPage = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const leadsToImport = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        if (values.length < 2) return null;
        
        const lead = {};
        headers.forEach((header, index) => {
          if (header.includes('company')) lead.companyName = values[index];
          else if (header.includes('website')) lead.website = values[index];
          else if (header.includes('email')) lead.email = values[index];
          else if (header.includes('industry')) lead.industry = values[index];
        });
        
        return lead.companyName && lead.website ? lead : null;
      }).filter(l => l);

      if (leadsToImport.length > 0) {
        try {
          setIsAnalyzing(true);
          await axios.post('/api/bulk-add-leads', { leads: leadsToImport });
          fetchLeads();
          alert(`Successfully imported ${leadsToImport.length} leads!`);
        } catch (err) {
          console.error("Bulk import failed", err);
          alert("Bulk import failed. Check console for details.");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (overrideUrl = null) => {
    const targetUrl = typeof overrideUrl === 'string' ? overrideUrl : url;
    if (!targetUrl) return;
    
    // Simple URL parse to get domain name if possible
    let cName = targetUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    
    setIsAnalyzing(true);
    setShowThinking(true); // show the AI animation modal
    
    try {
      // 1. Analyze Website
      const analyzeRes = await axios.post('/api/analyze-website', { website: targetUrl });
      const analysis = analyzeRes.data;
      setAnalysisResult(analysis);

      // 2. Add Lead (mock step to store it)
      const leadRes = await axios.post('/api/add-lead', { 
        companyName: cName, 
        website: targetUrl, 
        industry: analysis.industry,
        email: `contact@${cName}`
      });
      fetchLeads();

      // 3. Generate Campaign
      const campRes = await axios.post('/api/generate-campaign', {
        companyName: cName,
        industry: analysis.industry,
        audience: analysis.audience,
        opportunity: analysis.opportunity
      });
      setGeneratedCampaign(campRes.data);

    } catch (err) {
      console.error("Analysis Failed", err);
      alert("Error generating campaign. Check terminal.");
    } finally {
      // Delay closing modal slightly after data loads or until user clicks
      setIsAnalyzing(false); 
      // let AIThinking component call onComplete to close itself
    }
  };

  const navigateToDispatch = () => {
    if (!generatedCampaign) return;
    navigate('/dispatch', { state: { campaign: generatedCampaign } });
  };

  const handleBatchDispatch = () => {
    const selectedLeads = leads.filter(l => selectedLeadIds.includes(l._id));
    if (selectedLeads.length === 0) return;
    
    // Map leads to the format expected by dispatch (or include their campaignData)
    const leadsWithCampaigns = selectedLeads.map(l => ({
      ...l,
      campaign: l.campaignData && l.campaignData.length > 0 ? l.campaignData[0] : null
    }));

    navigate('/dispatch', { state: { leads: leadsWithCampaigns } });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l._id));
    }
  };

  const toggleLeadSelection = (id) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="pb-20 pt-8">
      {/* Conditionally show AI modal */}
      {showThinking && (
        <AIThinking onComplete={() => setShowThinking(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Lead Discovery</h2>
          <p className="text-muted mt-1">Discover, score, and analyze potential clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Actions */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <Search className="w-5 h-5 text-primary-main" /> AI Discovery Engine
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Company Website URL</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="e.g. stripe.com" 
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-main/50 transition-all"
                />
              </div>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !url}
                className="w-full bg-primary-gradient px-4 py-3 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-main/20 transition-all"
              >
                {isAnalyzing ? "Starting Engine..." : "Analyze & Generate Campaign"}
              </button>
            </div>
              <label className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 cursor-pointer hover:text-white text-muted text-sm transition-colors">
                <UploadCloud className="w-4 h-4" /> Bulk Import CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isAnalyzing}
                />
              </label>
          </div>

          {/* Generated Result Stats */}
          {analysisResult && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-panel p-6 bg-surface/90"
             >
               <h4 className="text-sm font-bold text-white mb-3">AI Analysis Result</h4>
               <ul className="space-y-3 mb-5">
                 <li className="text-xs text-gray-400">
                    <span className="text-white font-semibold">Industry: </span> {analysisResult.industry}
                 </li>
                 <li className="text-xs text-gray-400">
                    <span className="text-white font-semibold">Audience: </span> {analysisResult.audience}
                 </li>
                 <li className="text-xs text-gray-400">
                    <span className="text-white font-semibold">Opportunity: </span> {analysisResult.opportunity}
                 </li>
               </ul>

               {analysisResult.caption && (
                 <>
                   <h4 className="text-sm font-bold text-white mb-2 pt-4 border-t border-white/10">Social Media Caption</h4>
                   <p className="text-xs text-primary-light bg-primary-main/10 p-3 rounded-lg border border-primary-main/20 font-medium italic">
                     "{analysisResult.caption}"
                   </p>
                 </>
               )}

               {analysisResult.posterUrl && (
                 <div className="mt-5 pt-4 border-t border-white/10">
                   <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                     Canva Auto-Generated Poster
                   </h4>
                   <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg group relative">
                     <img 
                       src={analysisResult.posterUrl} 
                       alt="Generated Campaign Poster" 
                       className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                       <span className="text-xs text-white font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">View Full Asset</span>
                     </div>
                   </div>
                 </div>
               )}
             </motion.div>
          )}

          {/* Campaign Preview Area */}
          {generatedCampaign && !showThinking && (
            <CampaignPreview campaign={generatedCampaign} onActionClick={navigateToDispatch} />
          )}

        </div>

        {/* Right Column - Table */}
        <div className="lg:col-span-2 glass-panel overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface/40">
            <h3 className="text-lg font-semibold text-white">Scored Leads</h3>
            <div className="flex items-center gap-4">
              {selectedLeadIds.length > 0 && (
                <button
                  onClick={handleBatchDispatch}
                  className="bg-accent/20 hover:bg-accent/30 text-accent text-xs font-bold py-1.5 px-4 rounded-lg transition-all flex items-center gap-2"
                >
                  Batch Dispatch Selected ({selectedLeadIds.length})
                </button>
              )}
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-300">
                {leads.length} leads found
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface/60 text-muted uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/10 bg-surface/50 text-primary-main focus:ring-primary-main/50"
                      checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Industry</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead._id} className={`hover:bg-white/[0.02] transition-colors ${selectedLeadIds.includes(lead._id) ? 'bg-white/[0.04]' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/10 bg-surface/50 text-primary-main focus:ring-primary-main/50"
                        checked={selectedLeadIds.includes(lead._id)}
                        onChange={() => toggleLeadSelection(lead._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{lead.companyName}</div>
                      <div className="text-xs text-muted mt-0.5">{lead.website}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{lead.industry || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${lead.leadScore > 60 ? 'bg-accent' : lead.leadScore > 30 ? 'bg-yellow-400' : 'bg-red-500'}`} />
                        <span className="font-medium text-white">{lead.leadScore}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {lead.campaignData && lead.campaignData.length > 0 && (
                          <button 
                            onClick={() => {
                              navigate('/dispatch', { state: { campaign: lead.campaignData[0] } });
                            }}
                            className="text-xs px-3 py-1.5 rounded-md bg-accent/20 hover:bg-accent/30 text-accent font-semibold transition-colors"
                          >
                            View Campaign
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setUrl(lead.website);
                            handleAnalyze(lead.website);
                          }}
                          className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Analyze
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted">
                       No leads discovered yet. Try analyzing a website!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDiscoveryPage;
