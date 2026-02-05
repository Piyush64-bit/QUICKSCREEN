import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Zap, Shield, Globe, ArrowRight, X } from 'lucide-react';
import { generateRoomId } from '../utils/generateRoomId';
import { AnimatePresence, motion } from 'framer-motion';

const LandingPage = () => {

  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    const id = generateRoomId();
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) return;
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 opacity-[0.03] z-50 pointer-events-none bg-noise mix-blend-overlay"></div>

      {/* HERO */}
      <section className="relative px-6 pt-32 pb-24 flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
             <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />
             <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000" />
             <div className="absolute -bottom-[10%] left-[40%] w-[600px] h-[600px] bg-primary/10 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Badge */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
        >
          <span className="flex w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            v2.0 Now Live
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-white max-w-6xl mb-8 leading-[0.9] z-10"
        >
          Share screen <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-600">
             instantly.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-xl mb-12 leading-relaxed font-light z-10"
        >
          Zero latency. Zero downloads. <span className="text-white font-medium">Peer-to-peer</span> sharing for the modern web.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 z-10"
        >
          <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-glow-lg hover:shadow-glow-xl transition-all" onClick={createRoom}>
            Start Sharing
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <div className="relative group">
              <input 
                  type="text" 
                  placeholder="Enter Code..." 
                  className="bg-transparent border-b border-white/20 px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all w-40 text-center font-mono uppercase tracking-widest"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              />
              <button 
                  onClick={joinRoom}
                  disabled={!roomCode}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white disabled:opacity-0 transition-all"
              >
                  <ArrowRight className="w-4 h-4" />
              </button>
          </div>
        </motion.div>
      </section>

      {/* BENTO FEATURES */}
      <section className="px-6 py-32 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
        
          {/* Card 1: Speed (Large Wide) */}
          <Card className="col-span-1 md:col-span-2 row-span-1 p-10 hover:bg-white/[0.02] transition-all group relative overflow-hidden flex flex-row items-center justify-between">
             <div className="z-10 max-w-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Powered by WebRTC for ultra-low latency peer-to-peer streaming.</p>
             </div>
             {/* Abstract Graphic */}
             <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent skew-x-12 translate-x-12 opacity-50" />
          </Card>

          {/* Card 2: Mobile (Tall) */}
          <Card className="col-span-1 md:col-span-1 row-span-2 p-8 hover:bg-white/[0.02] transition-all group relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 text-secondary">
               <Globe className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Browser Native</h3>
             <p className="text-gray-400 mb-8 max-w-xs mx-auto">Works on Chrome, Firefox, Safari, and Edge. No bulky software downloads.</p>
             
             {/* Fake Phone UI */}
             <div className="w-48 h-64 bg-surface rounded-t-3xl border-t-4 border-l-4 border-r-4 border-white/10 shadow-2xl relative overflow-hidden">
                <div className="w-full h-full bg-background/50 flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-secondary/20 animate-pulse" />
                </div>
             </div>
          </Card>

          {/* Card 3: Privacy (Wide) */}
          <Card className="col-span-1 md:col-span-2 row-span-1 p-10 hover:bg-white/[0.02] transition-all group relative overflow-hidden flex flex-row items-center justify-between">
             <div className="z-10 max-w-sm">
                 <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 text-green-400">
                    <Shield className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Privacy First</h3>
                 <p className="text-gray-400">No servers see your screen. End-to-end encryption ensures your data stays private.</p>
             </div>
             <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-green-500/5 rounded-full blur-3xl opacity-50" />
          </Card>

        </div>
      </section>

      {/* HOW IT WORKS - ANIMATED TIMELINE */}
      <section className="px-6 py-32 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-24 tracking-tight">How it works</h2>
          
          <div className="space-y-24 relative">
             {/* Connecting Line */}
             <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 hidden md:block" />

             {[
               { step: "01", title: "Create a Room", desc: "One click to generate a secure, unique room ID. No account needed." },
               { step: "02", title: "Share the Link", desc: "Copy the URL and send it to anyone. They just click to join." },
               { step: "03", title: "Start Streaming", desc: "Select the screen or window you want to share. That's it." }
             ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="flex flex-col md:flex-row gap-8 md:gap-16 relative"
                >
                   {/* Step Number Bubble */}
                   <div className="flex-shrink-0 z-10">
                      <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-sm font-bold text-primary shadow-glow">
                        {s.step}
                      </div>
                   </div>

                   {/* Content */}
                   <div className="pt-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
                      <p className="text-gray-400 text-lg font-light leading-relaxed max-w-lg">
                        {s.desc}
                      </p>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* JOIN MODAL */}
      <AnimatePresence>
        {showJoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10"
            >
              
              {/* Header with decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Join Session
                  </h3>
                  <button 
                    onClick={() => setShowJoin(false)}
                    className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
                      Room Code
                    </label>
                    <input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="e.g. 123-456-789"
                      className="w-full px-5 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.03] transition-all font-mono text-lg tracking-wide"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 border border-white/10 hover:bg-white/5" 
                      onClick={() => setShowJoin(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={joinRoom}
                      disabled={!roomCode.trim()}
                    >
                      Join Room <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-sm text-gray-500">
                    Entering a secure peer-to-peer connection
                  </p>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
