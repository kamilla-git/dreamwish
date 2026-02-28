'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Background3D from '@/components/3d/Background3D';
import Header from '@/components/layout/Header';
import DemoWishlist from '@/components/DemoWishlist';
import { Gift, Zap, ArrowRight, Sparkles, Leaf, Moon, Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [fireflies, setFireflies] = useState<any[]>([]);

  useEffect(() => {
    // Генерируем светлячков только на клиенте, чтобы избежать ошибок гидратации
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      width: Math.random() * 4 + 2 + 'px',
      height: Math.random() * 4 + 2 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      duration: (Math.random() * 10 + 5) + 's',
      delay: (Math.random() * 5) + 's'
    }));
    setFireflies(items);
  }, []);

  const handleStart = () => {
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      origin: { y: 0.6 }, 
      colors: ['#059669', '#fbbf24', '#fcd34d'] 
    });
    setTimeout(() => { window.location.href = '/register'; }, 1000);
  };

  return (
    <div className="relative min-h-screen text-emerald-50 overflow-x-hidden selection:bg-gold-500/30">
      <Header />
      
      {/* Whimsical Forest Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/80 z-[1] backdrop-blur-[2px]" /> 
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-700/30 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold-500/20 blur-[150px] rounded-full animate-float" />
        <Background3D showSpheres={true} />
        {/* Fireflies / Fairy Dust */}
        {fireflies.map((f) => (
          <div 
            key={f.id} 
            className="absolute bg-gold-400 rounded-full animate-float opacity-40 blur-[1px]" 
            style={{ 
              width: f.width, 
              height: f.height, 
              top: f.top, 
              left: f.left,
              animationDuration: f.duration,
              animationDelay: f.delay
            }} 
          />
        ))}
      </div>
      
      <main className="relative z-10 pt-32 pb-20 container mx-auto px-6 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold-500/30 bg-emerald-900/40 backdrop-blur-md mb-8 shadow-inner"
        >
          <Leaf className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gold-300 drop-shadow-md">Откройте магию желаний</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-16 text-center max-w-full px-4"
        >
          <h1 className="text-5xl md:text-8xl font-serif font-normal tracking-tight text-emerald-50 leading-[1.2]">
            Дневник ваших <br />
            <span 
              className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-clip-text text-transparent inline-block pb-4 mt-2 font-bold"
              style={{ 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              заветных желаний
            </span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }} 
          className="mb-12 max-w-2xl mx-auto"
        >
          <p className="text-lg md:text-xl text-emerald-100/80 font-medium leading-relaxed drop-shadow-md">
            Создавайте волшебные списки желаний в зачарованном лесу. <br className="hidden md:block" />
            Делитесь ими с близкими, и пусть магия сбудется.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32 w-full max-w-lg">
          <button 
            onClick={handleStart} 
            className="w-full sm:w-auto btn-primary py-4 px-8 text-base shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-3"
          >
            Создать вишлист <Sparkles className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsDemoOpen(true)}
            className="w-full sm:w-auto py-4 px-8 bg-emerald-900/50 backdrop-blur-xl border border-gold-500/20 text-emerald-100 hover:bg-emerald-800 hover:border-gold-500/50 rounded-full flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all shadow-lg"
          >
            Исследовать <Moon className="w-4 h-4 text-gold-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          <Feature icon={<Leaf className="text-emerald-400 w-8 h-8" />} title="Органично" desc="Легко добавляйте желания по ссылке, словно собирая листья в лесу." />
          <Feature icon={<Star className="text-gold-400 w-8 h-8" />} title="Магия сюрприза" desc="Мы скрываем имена дарителей, сохраняя тайну до самого праздника." />
          <Feature icon={<Gift className="text-purple-400 w-8 h-8" />} title="Общий сбор" desc="Друзья могут скинуться на крупную мечту по крупицам сказочной пыльцы." />
        </div>
      </main>

      <footer className="py-20 text-center opacity-40 text-xs font-serif italic relative z-10 border-t border-emerald-800 mt-20">
        ~ DreamWish &copy; 2026 ~
      </footer>

      {isDemoOpen && <DemoWishlist onClose={() => setIsDemoOpen(false)} onAction={() => { setIsDemoOpen(false); handleStart(); }} />}
    </div>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <div className="p-10 rounded-[2rem] bg-emerald-900/40 border border-gold-500/10 backdrop-blur-xl text-center group hover:border-gold-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gold-500/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
      <div className="mb-6 p-4 bg-emerald-950/50 rounded-2xl w-fit mx-auto border border-emerald-800 shadow-inner group-hover:rotate-12 transition-transform duration-500">{icon}</div>
      <h3 className="text-2xl font-serif font-bold mb-3 text-gold-200">{title}</h3>
      <p className="text-emerald-100/70 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
