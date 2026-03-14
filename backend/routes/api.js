const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const Email = require('../models/Email');
const Activity = require('../models/Activity');
const scraperService = require('../services/scraperService');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

// Add Lead
router.post('/add-lead', async (req, res) => {
  try {
    const { companyName, website, email, industry } = req.body;
    let score = Math.floor(Math.random() * 50) + 10; // basic random score base
    if(industry) score += 20;

    const lead = new Lead({ companyName, website, email, industry, leadScore: score });
    await lead.save();

    // Log activity
    await new Activity({
      type: 'LEAD_ADDED',
      text: `Added new lead: ${companyName}`,
      iconType: 'Users'
    }).save();

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Add Leads
router.post('/bulk-add-leads', async (req, res) => {
  try {
    const { leads } = req.body;
    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ error: "Invalid leads data. Expected an array." });
    }

    const savedLeads = [];
    for (const lData of leads) {
      const { companyName, website, email, industry } = lData;
      let score = Math.floor(Math.random() * 50) + 10;
      if (industry) score += 20;
      
      const lead = new Lead({ companyName, website, email, industry, leadScore: score });
      await lead.save();
      savedLeads.push(lead);
    }

    // Log activity
    await new Activity({
      type: 'LEAD_ADDED',
      text: `Bulk imported ${savedLeads.length} leads`,
      iconType: 'Users'
    }).save();

    res.json({ success: true, count: savedLeads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Leads with their Associated Campaigns
router.get('/leads', async (req, res) => {
  try {
    const leadsWithCampaigns = await Lead.aggregate([
      {
        $lookup: {
          from: 'campaigns',
          let: { leadCompanyName: '$companyName' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toLower: '$companyName' },
                    { $toLower: '$$leadCompanyName' }
                  ]
                }
              }
            }
          ],
          as: 'campaignData'
        }
      },
      {
        $sort: { leadScore: -1 }
      }
    ]);
    res.json(leadsWithCampaigns);
  } catch (error) {
    console.error("GET /leads error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Website
router.post('/analyze-website', async (req, res) => {
  try {
    const { website } = req.body;
    const scrapedText = await scraperService.scrapeWebsite(website);
    const analysis = await aiService.analyzeText(scrapedText);

    // Log activity
    await new Activity({
      type: 'WEBSITE_ANALYZED',
      text: `Analyzed website: ${website}`,
      iconType: 'Search'
    }).save();

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Campaign
router.post('/generate-campaign', async (req, res) => {
  try {
    const { companyName, industry, audience, opportunity } = req.body;
    const campaignData = await aiService.generateCampaign(companyName, industry, audience, opportunity);
    
    const campaign = new Campaign({
      companyName,
      headline: campaignData.headline,
      description: campaignData.description,
      cta: campaignData.cta,
      bannerUrl: campaignData.posterUrl || 'https://via.placeholder.com/600x300/6366F1/FFFFFF?text=' + encodeURIComponent(companyName)
    });
    await campaign.save();

    // Log activity
    await new Activity({
      type: 'CAMPAIGN_GENERATED',
      text: `Generated campaign for: ${companyName}`,
      iconType: 'LayoutTemplate'
    }).save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Email
router.post('/send-email', async (req, res) => {
  try {
    const { to, companyName, headline, bannerUrl, description, website, cta, html } = req.body;
    
    // Fetch the campaign to get the full poster bannerUrl if available and not strongly typed
    let finalBannerUrl = bannerUrl;
    if (!finalBannerUrl) {
      const activeCampaign = await Campaign.findOne({ companyName }).sort({ createdAt: -1 });
      finalBannerUrl = activeCampaign ? activeCampaign.bannerUrl : 'https://via.placeholder.com/600x300/6366F1/FFFFFF?text=' + encodeURIComponent(companyName);
    }
    
    const finalDescription = description || "Our AI PR Agent has analyzed your market presence and formulated a tailored, data-driven campaign strategy uniquely for your brand.";
    
    // Split the 'to' string by commas incase the user provides multiple emails
    const targetEmails = to.split(',').map(e => e.trim()).filter(e => e);
    
    const ctaText = cta || "Unlock Campaign";
    const targetLink = website || `https://${companyName.replace(/\s+/g, '').toLowerCase()}.com`;

    const subject = `AI Marketing Campaign for ${companyName}`;
    const message = `Hello ${companyName},\n\nWe analyzed your website and generated a personalized marketing campaign for your business.\n\nPreview:\n${headline}\n\nWould you like to explore this campaign further?`;
    
    const finalHtmlMessage = html || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Campaign Strategy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
          body { margin: 0; padding: 0; background-color: #0F172A; font-family: 'Space Grotesk', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #1E293B; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.1); }
          .header { text-align: center; background: linear-gradient(to right, rgba(99,102,241,0.1), rgba(168,85,247,0.1)); padding: 40px 20px 20px; }
          .badge { display: inline-block; background: linear-gradient(135deg, #6366F1, #A855F7, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 100px; background-color: rgba(255,255,255,0.05); }
          .title { color: #FFFFFF; font-size: 36px; font-weight: 700; margin: 0 0 24px; line-height: 1.1; letter-spacing: -1px; }
          .hero-container { margin: 0 20px; border-radius: 16px; padding: 4px; background: linear-gradient(135deg, #6366F1, #A855F7, #EC4899); overflow: hidden; position: relative; }
          .hero-image { width: 100%; height: auto; display: block; border-radius: 12px; }
          .content { padding: 40px 32px; text-align: left; }
          .greeting { color: #F8FAFC; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
          .description { color: #94A3B8; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
          .highlight-card { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #A855F7; }
          .highlight-label { color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; margin-top: 0; }
          .highlight-copy { color: #E2E8F0; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3; }
          .cta-container { text-align: center; margin: 40px 0 20px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #6366F1, #EC4899); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 100px; font-weight: 700; font-size: 16px;     letter-spacing: 0.5px; transition: transform 0.2s; box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.4); text-transform: uppercase; }
          .footer { background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); padding: 32px; text-align: center; }
          .footer-text { margin: 0; color: #64748B; font-size: 14px; line-height: 1.5; }
          .brand { background: linear-gradient(to right, #6366F1, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; }
          @media screen and (max-width: 600px) {
            .container { margin: 20px 10px; border-radius: 16px; }
            .title { font-size: 28px; }
            .content { padding: 30px 20px; }
            .cta-button { width: 100%; box-sizing: border-box; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Exclusive Drop 🚀</span>
            <h1 class="title">Next-Gen Strategy for ${companyName}</h1>
          </div>
          
          <div class="hero-container">
            <img src="${finalBannerUrl}" alt="Campaign Banner" class="hero-image" />
          </div>
          
          <div class="content">
            <div class="greeting">Yo Team ${companyName},</div>
            <p class="description">${finalDescription}</p>
            
            <div class="highlight-card">
              <p class="highlight-label">🔥 Viral Hook Generated</p>
              <h3 class="highlight-copy">"${headline}"</h3>
            </div>
            
            <p class="description">We ran the numbers and baked a full multi-channel rollout. Tap in to see the complete moodboard, audience breakdown, and conversion metrics.</p>
            
            <div class="cta-container">
              <a href="${targetLink}" class="cta-button">${ctaText}</a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">Driven by algorithm, designed for impact.<br><br>Sent securely via the <span class="brand">AI PR Agent</span> Lab</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    let processedEmails = [];
    
    // Loop over each customer email and process them individually
    for (const emailAddy of targetEmails) {
      const email = new Email({ to: emailAddy, subject, message, html: finalHtmlMessage });
      await email.save();
      // Enqueue
      emailService.enqueueEmail(email);
      processedEmails.push(email);
    }


    // Log activity
    await new Activity({
      type: 'EMAIL_SENT',
      text: `Sent ${targetEmails.length} automated emails for: ${companyName}`,
      iconType: 'Send'
    }).save();

    res.json({ success: true, message: `Queued ${processedEmails.length} emails`, count: processedEmails.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const campaignsGenerated = await Campaign.countDocuments();
    const emailsSent = await Email.countDocuments({ status: 'sent' });
    
    // Simple logic: assume 12% response rate if emails > 0, else 0%
    const responseRate = emailsSent > 0 ? '12%' : '0%';
    
    res.json({
      totalLeads,
      campaignsGenerated,
      emailsSent,
      responseRate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Recent Activities
router.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Chart Data (Aggregated by Day)
router.get('/chart-data', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const emailStats = await Email.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sent: { $sum: 1 },
          opened: { 
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } // Mocking opened as sent for visualization
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Map to the format frontend expects (Mon, Tue, etc.)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedData = emailStats.map(stat => {
      const date = new Date(stat._id);
      return {
        name: days[date.getDay()],
        sent: stat.sent,
        opened: Math.floor(stat.sent * 0.45) // Mocking opened as 45% of sent
      };
    });

    // Fill in remaining days if less than 7
    if (formattedData.length < 7) {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const existing = formattedData.find(item => item.name === dayName);
        result.push(existing || { name: dayName, sent: 0, opened: 0 });
      }
      return res.json(result);
    }

    res.json(formattedData);
  } catch (error) {
    console.error("GET /chart-data error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
