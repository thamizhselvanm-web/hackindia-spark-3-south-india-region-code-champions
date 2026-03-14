import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronRight } from 'lucide-react';
import { toPng } from 'html-to-image';

const CampaignPreview = ({ campaign, onActionClick }) => {
  const bannerRef = useRef(null);

  const downloadImage = async () => {
    if (!bannerRef.current) return;
    try {
      const dataUrl = await toPng(bannerRef.current, { 
        backgroundColor: '#0F172A', 
        pixelRatio: 2,
        skipFonts: true,
        style: { fontFamily: 'sans-serif' }
      });
      const link = document.createElement('a');
      link.download = `${campaign.companyName || 'campaign'}-banner.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  if (!campaign) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden border border-primary-main/30 shadow-2xl relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-start/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      {/* Banner Visual Area */}
      <div 
        ref={bannerRef}
        className="relative h-48 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center p-6 border-b border-white/5 bg-cover bg-center"
        style={campaign.posterUrl ? { backgroundImage: `url(${campaign.posterUrl})` } : {}}
      >
        {campaign.posterUrl && <div className="absolute inset-0 bg-[#0F172A]/50"></div>}
        {/* Ad Mockup inside the banner */}
        <div className="w-full h-full bg-white/5 backdrop-blur-md rounded-xl p-4 flex flex-col justify-between border border-white/10 relative overflow-hidden z-10">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/30 rounded-full blur-2xl -mr-4 -mt-4"></div>
           
           <div className="flex items-center justify-between z-10">
             <span className="font-bold text-lg text-white tracking-tight">{campaign.companyName}</span>
             <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70 backdrop-blur-sm">Sponsored</span>
           </div>
           
           <div className="z-10 mt-2">
             <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
               {campaign.headline}
             </h4>
             <p className="text-sm text-gray-400 mt-1 line-clamp-2">{campaign.description}</p>
           </div>
           
           <a href={campaign.website || `https://${campaign.companyName.replace(/\s+/g, '').toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" className="z-10 bg-[#7C3AED] text-white text-sm font-semibold py-1.5 px-4 rounded-lg self-start mt-3 cursor-pointer shadow-lg shadow-[#7C3AED]/20 flex items-center gap-1 hover:bg-[#7C3AED]/90 transition-colors inline-flex decoration-none">
              {campaign.cta} <ChevronRight className="w-4 h-4" />
           </a>
        </div>
      </div>

      {/* Meta details & Actions */}
      <div className="p-5 flex justify-between items-center bg-surface/50">
        <div>
          <h5 className="font-medium text-white text-sm">Suggested Banner Ad</h5>
          <p className="text-xs text-muted mb-1 mt-1">Generated from AI Audience Analysis</p>
          <p className="text-xs text-blue-400">"{campaign.caption}"</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadImage}
            className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-white border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onActionClick}
            className="px-4 py-2 bg-accent/20 text-accent font-semibold rounded-lg hover:bg-accent/30 transition-colors border border-accent/20"
          >
            Start Outreach
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignPreview;
