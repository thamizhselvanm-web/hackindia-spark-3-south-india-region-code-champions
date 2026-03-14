import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Send, X } from 'lucide-react';
import { RobotModel } from './RobotModel';

const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your interactive AI PR Assistant. How can I help you automate your outreach today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Show notification bubble after a few seconds if unopened
    const timer = setTimeout(() => {
      if (!isOpen) setShowBubble(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBubble(false);
      setIsResponding(true);
      setTimeout(() => setIsResponding(false), 500);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput("");
    setIsTyping(true);
    setIsResponding(true);

    // Simulate AI response delay
    const delay = 1000 + Math.random() * 1500;
    
    setTimeout(() => {
      setIsTyping(false);
      setIsResponding(false);
      
      const lowerText = userMsg.toLowerCase();
      let reply = "I can analyze websites, score leads, and generate full marketing copy for you.";
      
      if (lowerText.includes('hello') || lowerText.includes('hi')) {
        reply = "Hi there! Ready to discover some high-quality leads?";
      } else if (lowerText.includes('how')) {
        reply = "Just navigate to the Leads page, enter a company URL, and I'll analyze their website and generate a customized campaign!";
      } else if (lowerText.includes('campaign') || lowerText.includes('ad')) {
        reply = "I use GPT-4 to read their website and write highly targeted ads and emails. Try it out in the Leads tab.";
      }

      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    }, delay);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4 pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl w-[340px] h-[450px] flex flex-col shadow-2xl transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        <div className="p-4 bg-gradient-to-r from-primary-main/20 to-purple-600/20 border-b border-white/10 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"></span>
            <span className="font-semibold text-white">AI Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary-main text-white self-end rounded-br-sm' : 'bg-white/10 text-slate-100 self-start rounded-bl-sm'}`}
            >
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="bg-white/10 self-start p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2 rounded-b-2xl">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-main"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-primary-main rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors shadow-lg"
          >
            <Send size={16} className="-ml-1" />
          </button>
        </div>
      </div>

      {/* 3D Robot Container */}
      <div 
        className="w-[150px] h-[150px] relative cursor-pointer hover:-translate-y-2 transition-transform duration-300 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] pointer-events-auto"
        onClick={toggleChat}
      >
        <div className={`absolute -top-4 right-2 bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 shadow-xl z-10 pointer-events-none before:content-[''] before:absolute before:-bottom-1 before:right-4 before:w-0 before:h-0 before:border-l-[5px] before:border-r-[5px] before:border-t-[5px] before:border-l-transparent before:border-r-transparent before:border-t-white ${showBubble ? 'opacity-100 translate-y-0 animate-bounce' : 'opacity-0 translate-y-2'}`}>
          Need help? 👋
        </div>
        
        <Canvas camera={{ position: [0, 1.5, 5.5], fov: 45 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <pointLight position={[-3, 2, 3]} color="#6366f1" intensity={2.5} distance={10} />
          <RobotModel isResponding={isResponding} />
        </Canvas>
      </div>

    </div>
  );
};

export default AssistantWidget;
