'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Heart, Gift, ExternalLink, Loader2, Search, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { api, Wishlist } from '@/lib/api';
import { getTheme } from '@/lib/themes';

export default function Explore() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadExplore();
  }, []);

  const loadExplore = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPublicWishlists();
      setWishlists(data);
    } catch (err) {
      toast.error('Ошибка загрузки ленты');
    } finally {
      setLoading(false);
    }
  };

  const filtered = wishlists.filter(w => 
    w.title.toLowerCase().includes(search.toLowerCase()) || 
    (w.gifts || []).some(g => g.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#022c22] text-emerald-50 selection:bg-gold-500/30">
      <Header />
      
      <main className="relative z-10 max-w-7xl mx-auto pt-28 pb-20 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-gold-300 mb-2 flex items-center justify-center md:justify-start gap-3">
              <Globe className="w-8 h-8 text-gold-500" /> Explore Dreams
            </h1>
            <p className="text-emerald-300 font-medium">Откройте для себя публичные вишлисты и помогите чужой мечте сбыться.</p>
          </div>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <input 
              className="input-field pl-11 bg-emerald-950/60 border-emerald-800 text-white placeholder:text-emerald-600 focus:border-gold-500" 
              placeholder="Поиск по желаниям или событиям..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
            <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-[0.3em]">Загрузка магии...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((wl) => (
              <motion.div 
                key={wl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flat-card bg-emerald-900/40 border-gold-500/10 hover:border-gold-500/40 overflow-hidden flex flex-col group"
              >
                <div className="p-6 border-b border-emerald-800/50 bg-emerald-950/30">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center text-xl shadow-inner">
                        {getTheme(wl.theme).emoji}
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[9px] font-black uppercase border border-emerald-500/20">
                        {Math.round(wl.completion_percentage)}% Собрано
                      </div>
                   </div>
                   <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-gold-300 transition-colors truncate">{wl.title}</h3>
                   <p className="text-xs text-emerald-400/70 line-clamp-1">{wl.description || 'Публичный список желаний'}</p>
                </div>

                <div className="p-4 flex-1 space-y-3 bg-emerald-950/50">
                   {(wl.gifts || []).slice(0, 3).map(gift => (
                     <div key={gift.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-900/30 border border-emerald-800/50 group/gift">
                        <div className="w-10 h-10 rounded bg-emerald-950 overflow-hidden">
                           <img src={gift.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[11px] font-bold text-emerald-100 truncate">{gift.title}</p>
                           <p className="text-[10px] font-black text-gold-400">{gift.price.toLocaleString()} ₽</p>
                        </div>
                     </div>
                   ))}
                   {wl.gifts && wl.gifts.length > 3 && (
                     <p className="text-[10px] text-center text-emerald-600 font-bold uppercase tracking-widest pt-2">+ еще {wl.gifts.length - 3}</p>
                   )}
                </div>

                <div className="p-4 pt-0 bg-emerald-950/50">
                   <Link 
                    href={`/w/${wl.public_slug}`}
                    className="w-full btn-primary py-2.5 text-[10px] flex items-center justify-center gap-2"
                   >
                      Посмотреть всё <CreditCard className="w-3.5 h-3.5" />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-32">
             <Gift className="w-16 h-16 text-emerald-800 mx-auto mb-4" />
             <p className="text-emerald-500 font-medium">Ничего не найдено в лесу желаний</p>
          </div>
        )}
      </main>
    </div>
  );
}
