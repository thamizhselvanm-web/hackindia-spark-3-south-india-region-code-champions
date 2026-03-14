import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlitchLoader = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const [subText, setSubText] = useState('SYSTEM_CALIBRATING...');
  const [interference, setInterference] = useState([]);

  useEffect(() => {
    const texts = [
      'BOOT_SEQUENCE_ALPHA...',
      'BYPASSING_FIREWALL...',
      'DECRYPTING_ASSETS...',
      'NEURAL_LINK_ESTABLISHED',
      'ACCESSING_CORE_NODES...',
      'ERROR_0404_RECOVERED',
      'INITIALIZING_AGENT_X',
      'PROTOCOL_9_ENGAGED'
    ];

    let textIdx = 0;
    const textInterval = setInterval(() => {
      setSubText(texts[textIdx % texts.length]);
      textIdx++;
    }, 200);

    const interferenceInterval = setInterval(() => {
      const bars = Array.from({ length: 3 }).map(() => ({
        id: Math.random(),
        top: `${Math.random() * 100}%`,
        height: `${Math.random() * 4}px`,
        opacity: Math.random() * 0.5
      }));
      setInterference(bars);
      setTimeout(() => setInterference([]), 50);
    }, 400);

    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3000); // 3 seconds duration as requested

    return () => {
      clearInterval(textInterval);
      clearInterval(interferenceInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
          transition={{ duration: 1.2, ease: "circIn" }}
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden tremor-container"
        >
          {/* CRT scanline effect */}
          <div className="scanline" />
          <div className="noise-overlay" />

          {/* Interference Bars */}
          {interference.map(bar => (
            <div
              key={bar.id}
              className="interference-bar"
              style={{ top: bar.top, height: bar.height, opacity: bar.opacity }}
            />
          ))}

          {/* Glitch Content */}
          <div className="glitch-wrapper mb-6 scale-125 md:scale-150">
            <h1 className="glitch-text" data-text="ALOGO-F">
              ALGO-F
            </h1>
          </div>

          {/* Loading Stats Style */}
          <div className="flex flex-col items-center z-10">
            <div className="loading-bar-container w-64 md:w-96 !h-1 bg-white/5 border border-white/10">
              <div className="loading-bar-progress" style={{ animationDuration: '3s' }} />
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-[10px] font-mono text-primary-main font-bold uppercase tracking-[0.3em] bg-primary-main/10 px-4 py-1 rounded border border-primary-main/20 animate-pulse">
                {subText}
              </div>

              <div className="flex gap-6 mt-2 opacity-40">
                <div className="text-[8px] font-mono text-white/60 uppercase tracking-widest">
                  MEM_DUMP: {Math.random().toString(16).slice(2, 8)}
                </div>
                <div className="text-[8px] font-mono text-white/60 uppercase tracking-widest">
                  LOC: 0x{Math.random().toString(16).slice(2, 6)}
                </div>
              </div>
            </div>
          </div>

          {/* Random flashes */}
          <motion.div
            animate={{ opacity: [0, 0.05, 0, 0.1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlitchLoader;
