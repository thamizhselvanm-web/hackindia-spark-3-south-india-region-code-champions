import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CampaignDispatchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const campaign = location.state?.campaign; // Single campaign mode
  const batchLeads = location.state?.leads || []; // Batch mode

  // Current lead being previewed (defaults to first in batch or fake lead from single campaign)
  const [previewLeadIndex, setPreviewLeadIndex] = useState(0);

  const getActiveLead = () => {
    if (batchLeads.length > 0) {
      return batchLeads[previewLeadIndex];
    }
    return {
      companyName: campaign?.companyName,
      website: campaign?.website,
      email: campaign?.email,
      campaign: campaign
    };
  };

  const activeLead = getActiveLead();
  const activeCampaign = activeLead?.campaign || campaign;

  const [emails, setEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const defaultHtmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #0F172A; color: #FFFFFF; font-family: sans-serif; padding: 40px; }
    .card { background: #1E293B; border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); max-width: 600px; margin: auto; }
    .headline { font-size: 32px; font-weight: bold; margin-bottom: 20px; color: #6366F1; }
    .description { color: #94A3B8; line-height: 1.6; }
    .cta { display: inline-block; background: linear-gradient(135deg, #6366F1, #EC4899); color: white; padding: 12px 30px; border-radius: 100px; text-decoration: none; margin-top: 30px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="headline">{{headline}}</div>
    <p class="description">{{description}}</p>
    <a href="{{website}}" class="cta">{{cta}}</a>
  </div>
</body>
</html>`.trim();

  const [customHtml, setCustomHtml] = useState(defaultHtmlTemplate);

  const getProcessedHtml = (html, leadContext) => {
    const l = leadContext || activeLead;
    const c = l.campaign || activeCampaign;
    
    return html
      .replace(/{{companyName}}/g, l.companyName || '')
      .replace(/{{headline}}/g, c?.headline || '')
      .replace(/{{description}}/g, c?.description || '')
      .replace(/{{website}}/g, l.website || `https://${(l.companyName || 'brand').replace(/\s+/g, '').toLowerCase()}.com`)
      .replace(/{{cta}}/g, c?.cta || 'Learn More')
      .replace(/{{bannerUrl}}/g, c?.posterUrl || '');
  };

  // If no campaign data was passed, redirect back to leads
  if (!campaign && batchLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Leads Selected</h2>
        <p className="text-muted mb-6">Please select leads or generate a campaign from the Lead Discovery engine first.</p>
        <button 
          onClick={() => navigate('/leads')}
          className="px-6 py-2 bg-primary-gradient rounded-lg text-white font-semibold"
        >
          Go to Leads
        </button>
      </div>
    );
  }

  // Pre-fill with a default guess if empty
  const defaultEmail = batchLeads.length > 0 
    ? batchLeads.map(l => l.email || `contact@${l.companyName.toLowerCase().replace(/\s+/g, '')}.com`).join(', ')
    : `contact@${(activeLead.companyName || 'brand').toLowerCase().replace(/\s+/g, '')}.com`;

  const handleSend = async () => {
    const targetEmailsRaw = emails.trim() || defaultEmail;
    const targetEmailsList = targetEmailsRaw.split(',').map(e => e.trim()).filter(e => e);
    
    setIsSending(true);
    setStatus({ type: '', message: '' });

    try {
      if (batchLeads.length > 0) {
        // Batch Send Logic
        let successCount = 0;
        for (const lead of batchLeads) {
          const lCampaign = lead.campaign;
          if (!lCampaign) continue;

          await axios.post('/api/send-email', {
            to: lead.email || `contact@${lead.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
            companyName: lead.companyName,
            headline: lCampaign.headline,
            bannerUrl: lCampaign.posterUrl,
            description: lCampaign.description,
            website: lead.website || `https://${lead.companyName.replace(/\s+/g, '').toLowerCase()}.com`,
            cta: lCampaign.cta,
            html: showHtmlEditor ? getProcessedHtml(customHtml, lead) : null
          });
          successCount++;
        }
        setStatus({ 
          type: 'success', 
          message: `Successfully dispatched campaigns to ${successCount} companies!` 
        });
      } else {
        // Single Send Logic
        const res = await axios.post('/api/send-email', {
          to: targetEmailsRaw,
          companyName: activeLead.companyName,
          headline: activeCampaign.headline,
          bannerUrl: activeCampaign.posterUrl,
          description: activeCampaign.description,
          website: activeLead.website || `https://${activeLead.companyName.replace(/\s+/g, '').toLowerCase()}.com`,
          cta: activeCampaign.cta,
          html: showHtmlEditor ? getProcessedHtml(customHtml) : null
        });
        setStatus({ 
          type: 'success', 
          message: `Successfully queued ${res.data.count || 1} emails to the dispatch pipeline!` 
        });
      }
      setEmails('');
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to queue emails. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20 pt-8 max-w-4xl mx-auto"
    >
      <button 
        onClick={() => navigate('/leads')}
        className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Discovery
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Campaign Dispatch</h2>
          <p className="text-muted mt-1">Configure recipients and launch your automated outreach.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Dispatch Form */}
        <div className="glass-panel p-6 shadow-2xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary-main/20 text-primary-main">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Recipient List</h3>
              <p className="text-sm text-gray-400">Enter target email addresses.</p>
            </div>
          </div>

          <div className="flex-grow space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Target Email Addresses (comma separated)
              </label>
              <textarea 
                rows={5}
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder={`e.g. ${defaultEmail}, founders@startup.com`}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-main/50 transition-all resize-none shadow-inner"
              />
              <p className="text-xs text-muted mt-2">
                All addresses entered here will receive their own personalized HTML copy of the campaign.
              </p>
            </div>

            {status.message && (
              <div className={`p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {status.message}
              </div>
            )}
          </div>

          <button 
            onClick={handleSend}
            disabled={isSending}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-primary-gradient px-4 py-4 rounded-xl text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-primary-main/20 transition-all text-lg"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Dispatching...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" /> Launch Campaign
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button 
              onClick={() => setShowHtmlEditor(!showHtmlEditor)}
              className="text-primary-light hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              {showHtmlEditor ? 'Close Advanced Editor' : 'Edit Email HTML Manually'}
            </button>
            
            {showHtmlEditor && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-4"
              >
                <div className="p-3 bg-primary-main/10 border border-primary-main/20 rounded-lg">
                  <p className="text-xs text-primary-light">
                    Use placeholders: <code className="bg-black/20 px-1">{"{{headline}}"}</code>, <code className="bg-black/20 px-1">{"{{description}}"}</code>, <code className="bg-black/20 px-1">{"{{website}}"}</code>, <code className="bg-black/20 px-1">{"{{cta}}"}</code>
                  </p>
                </div>
                <textarea 
                  rows={12}
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-main/50 transition-all resize-none shadow-inner"
                />

                <div className="glass-panel p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Personalization Preview</h5>
                    {batchLeads.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">Previewing Lead:</span>
                        <select 
                          className="bg-surface border border-white/10 rounded text-[10px] text-white px-2 py-1 focus:outline-none"
                          value={previewLeadIndex}
                          onChange={(e) => setPreviewLeadIndex(parseInt(e.target.value))}
                        >
                          {batchLeads.map((l, i) => (
                            <option key={l._id} value={i}>{l.companyName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div 
                    className="w-full min-h-[300px] bg-white rounded-lg overflow-auto shadow-2xl"
                    style={{ zoom: 0.6 }}
                    dangerouslySetInnerHTML={{ __html: getProcessedHtml(customHtml) }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Col: Campaign Context */}
        <div className="space-y-6">
          <div className="glass-panel p-6 bg-surface/40">
            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {batchLeads.length > 0 ? `Batch Overview (${batchLeads.length} Companies)` : 'Payload Overview'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Recipient Context</p>
                <p className="text-lg font-bold text-white tracking-tight">{activeLead.companyName}</p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-primary-main font-semibold mb-1">Active Ad Headline</p>
                <p className="text-base text-gray-200 font-medium line-clamp-2">
                  "{activeCampaign?.headline}"
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Supporting Copy</p>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {activeCampaign?.description}
                </p>
              </div>

              {activeCampaign?.posterUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/5 shadow-2xl">
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider z-10">
                    Lead Specific Poster
                  </div>
                  <img 
                    src={activeCampaign.posterUrl} 
                    alt="Generated Campaign Poster" 
                    className="w-full object-cover max-h-48"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CampaignDispatchPage;
