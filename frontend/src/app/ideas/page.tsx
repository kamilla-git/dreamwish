'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Search, ArrowRight, Gift, Smartphone, Heart, Home, Plane, Camera, Palette, Music } from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'tech', name: 'Гаджеты', icon: <Smartphone className="w-5 h-5"/>, color: 'text-blue-400' },
  { id: 'home', name: 'Дом и уют', icon: <Home className="w-5 h-5"/>, color: 'text-orange-400' },
  { id: 'hobby', name: 'Хобби', icon: <Palette className="w-5 h-5"/>, color: 'text-violet-400' },
  { id: 'travel', name: 'Путешествия', icon: <Plane className="w-5 h-5"/>, color: 'text-teal-400' },
  { id: 'creative', name: 'Творчество', icon: <Camera className="w-5 h-5"/>, color: 'text-rose-400' }
];

const IDEAS = [
  { category: 'tech', title: 'Яндекс Станция Миди', price: '14 990 ₽', desc: 'Умная колонка с Zigbee и Zigbee хабом.' },
  { category: 'tech', title: 'Наушники Sony WH-1000XM5', price: '32 000 ₽', desc: 'Лучшее шумоподавление для работы.' },
  { category: 'home', title: 'Плед крупной вязки', price: '4 500 ₽', desc: 'Уютный подарок для зимних вечеров.' },
  { category: 'home', title: 'Набор свечей с ароматом кожи', price: '2 800 ₽', desc: 'Стильный акцент в интерьере.' },
  { category: 'hobby', title: 'Набор для рисования по номерам', price: '1 200 ₽', desc: 'Медитативное занятие на выходные.' },
  { category: 'travel', title: 'Чемодан для ручной клади Xiaomi', price: '6 500 ₽', desc: 'Надежный спутник в поездках.' },
  { category: 'creative', title: 'Фотоаппарат Fujifilm Instax', price: '9 800 ₽', desc: 'Моментальные снимки для памяти.' }
];

export default function GiftIdeas() {
  const [selectedCat, setSelectedCat] = useState('tech');

  const filtered = IDEAS.filter(i => i.category === selectedCat);

  return (
    <div className="min-h-screen bg-[#022c22] text-emerald-50 selection:bg-gold-500/30">
      <Header />
      
      <main className="relative z-10 max-w-6xl mx-auto pt-28 pb-20 px-6">
        <div className="text-center mb-16">
           <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/20 bg-emerald-900/40 mb-6"
           >
              <Lightbulb className="w-4 h-4 text-gold-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-400">Gift Ideas 2026</span>
           </motion.div>
           <h1 className="text-4xl md:text-6xl font-serif font-bold text-emerald-50 mb-4">Что подарить?</h1>
           <p className="text-emerald-200/70 max-w-xl mx-auto">Мы собрали лучшие идеи, чтобы вы могли вдохновиться и добавить их в свой волшебный лес желаний.</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
           {CATEGORIES.map(cat => (
             <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${selectedCat === cat.id ? 'bg-gold-500/10 border-gold-500 text-emerald-50 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:border-emerald-600'}`}
             >
                <span className={cat.color}>{cat.icon}</span>
                <span className="text-sm font-bold">{cat.name}</span>
             </button>
           ))}
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence mode="wait">
             {filtered.map((idea, idx) => (
               <motion.div
                key={idea.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="flat-card p-6 bg-emerald-900/40 border-gold-500/10 hover:border-gold-500/40 group cursor-default"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-emerald-950/50 rounded-2xl text-gold-400 group-hover:rotate-12 transition-transform shadow-inner">
                        <Gift className="w-6 h-6" />
                     </div>
                     <span className="text-lg font-black text-emerald-50">{idea.price}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gold-200 mb-2">{idea.title}</h3>
                  <p className="text-sm text-emerald-400/70 leading-relaxed mb-6">{idea.desc}</p>
                  
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest hover:gap-3 transition-all"
                  >
                    Добавить в список <ArrowRight className="w-4 h-4" />
                  </Link>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
