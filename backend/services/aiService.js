// Mock sleep function to simulate UI thinking animations
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.analyzeText = async (text) => {
  // Mock implementation with 3s delay to allow frontend animation
  await sleep(3000);
  
  // Extract simple keywords from the scraped text as a mock
  const words = text.split(' ').filter(w => w.length > 5);
  const keyword1 = words[Math.floor(Math.random() * words.length)] || 'Technology';
  const keyword2 = words[Math.floor(Math.random() * words.length)] || 'Business';
  const keyword3 = words[Math.floor(Math.random() * words.length)] || 'Solutions';

  return {
    industry: `${keyword1} ${keyword2} Services`.replace(/[^a-zA-Z\s]/g, '').trim(),
    audience: `Professionals seeking ${keyword3}`.replace(/[^a-zA-Z\s]/g, '').trim(),
    opportunity: `Leveraging ${keyword1} to improve ${keyword2} workflows and save 40% time.`,
    caption: `Supercharge your business with ${keyword1} and see real results! 🚀 #Growth #${keyword2}`,
    posterUrl: `https://via.placeholder.com/600x600/6366F1/FFFFFF?text=${encodeURIComponent(keyword1 + ' ' + keyword3)}`
  };
};

exports.generateCampaign = async (companyName, industry, audience, opportunity) => {
  // Mock implementation with 3s delay
  await sleep(3000);
  return {
    headline: `Invest Smarter with ${companyName || 'Us'}`,
    description: `AI-powered ${industry} solutions tailored for modern ${audience || 'users'} to maximize efficiency and capture the ${opportunity.substring(0, 30)} opportunity.`,
    cta: `Start Optimizing Today`,
    caption: `Transform your workflow with ${companyName}. #Innovation #${industry.split(' ')[0]}`,
    posterUrl: `https://via.placeholder.com/600x300/6366F1/FFFFFF?text=${encodeURIComponent(companyName || 'Campaign')}`
  };
};
