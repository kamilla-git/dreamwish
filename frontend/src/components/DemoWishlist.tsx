'use client';

import { motion } from 'framer-motion';
import { Heart, X, ExternalLink, CreditCard, Lock, Calendar, Leaf } from 'lucide-react';

const DEMO_ITEMS = [
  { 
    id: 2, 
    title: "Умные часы Apple Watch Series 10", 
    price: 45000, 
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
    collected: 45000 
  },
  { 
    id: 3, 
    title: "Кофемашина DeLonghi Magnifica", 
    price: 52000, 
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
    collected: 5200 
  },
  { 
    id: 4, 
    title: "Кроссовки Nike Air Jordan 1", 
    price: 18000, 
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    collected: 18000 
  }
];

export default function DemoWishlist({ onClose, onAction }: { onClose: () => void, onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="w-full max-w-6xl h-full max-h-[90vh] bg-emerald-900 border border-gold-500/20 shadow-2xl rounded-[2rem] flex flex-col relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-emerald-950/50 border border-emerald-800 hover:bg-emerald-800 rounded-full transition-all text-emerald-300 hover:text-gold-400 z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto flex-1 relative z-10">
          <div className="mb-12 relative max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                 <div className="bg-gold-500/10 text-gold-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gold-500/30">
                    Публичный пример
                 </div>
                 <div className="bg-emerald-950/60 text-emerald-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-800">
                    <Calendar className="w-3.5 h-3.5" /> До 31 декабря
                 </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-black text-emerald-50 tracking-tight mb-4 drop-shadow-md">Демо: Лесной Праздник 🎉</h2>
              <p className="text-lg text-emerald-200/80 leading-relaxed font-medium">Посмотрите, как ваши друзья увидят ваши желания, смогут зарезервировать подарок или скинуться на него магической пыльцой.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_ITEMS.map((item) => {
              const progress = (item.collected / item.price) * 100;
              const isReserved = progress >= 100;
              return (
                <div key={item.id} className="flat-card flex flex-col group overflow-hidden bg-emerald-950/40 border-gold-500/10 hover:border-gold-500/40">
                  <div className="relative aspect-[4/3] overflow-hidden bg-emerald-950">
                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />
                    {isReserved && (
                      <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-6 text-center z-20">
                        <div className="animate-in zoom-in duration-500">
                           <div className="w-16 h-16 bg-gold-500 text-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                              <Heart className="w-8 h-8" />
                           </div>
                           <p className="font-serif font-bold text-xl text-gold-300 drop-shadow-md">Уже исполнено</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col relative z-10 -mt-8">
                    <div className="mb-4">
                      <h3 className="text-xl font-serif font-bold mb-1 line-clamp-2 leading-tight text-emerald-50 text-contrast-shadow">{item.title}</h3>
                      <p className="text-2xl font-black text-gold-400 drop-shadow-md">{item.price.toLocaleString()} ₽</p>
                    </div>
                    
                    <div className="mt-auto space-y-6">
                      <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-800/50">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                          <span>Собрано пыльцы</span>
                          <span className="text-gold-300">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-gold-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {!isReserved && (
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={onAction} className="py-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all flex items-center justify-center gap-2 shadow-inner">
                            <Heart className="w-4 h-4" /> Забрать
                          </button>
                          <button onClick={onAction} className="btn-primary py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" /> Помочь
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-emerald-950/80 border-t border-emerald-800 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 z-10 relative">
          <div className="flex items-center gap-4 text-emerald-300 text-sm font-medium max-w-xl">
            <Lock className="w-6 h-6 text-gold-400 flex-shrink-0" />
            <p>Это демонстрационный режим. Чтобы создать свой волшебный дневник — авторизуйтесь.</p>
          </div>
          <button 
            onClick={onAction}
            className="w-full sm:w-auto btn-primary whitespace-nowrap px-8 py-4"
          >
            Начать путешествие
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
