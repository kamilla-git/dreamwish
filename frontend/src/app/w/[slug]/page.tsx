'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, CreditCard, Loader2, ExternalLink, Calendar, Lock, Share2, Check, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import ThemeAnimations from '@/components/ThemeAnimations';
import { api, Wishlist, Gift as GiftType } from '@/lib/api';
import { getTheme } from '@/lib/themes';
import useSocket from '@/lib/useSocket';

export default function PublicWishlistPage() {
  const { slug } = useParams();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Contribution Modal States
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await api.getPublicWishlist(slug as string);
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Real-time updates via Socket.IO
  useSocket(slug as string, useCallback((event: any) => {
    if (event.type === 'gift_reserved' || event.type === 'contribution_added') {
      loadWishlist();
      if (event.type === 'gift_reserved') {
        toast.info('Кто-то только что зарезервировал подарок!');
      }
    }
  }, [loadWishlist]));

  const handleReserve = async (giftId: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Пожалуйста, зарегистрируйтесь, чтобы зарезервировать подарок');
      setTimeout(() => window.location.href = '/register', 1500);
      return;
    }

    if (!confirm('Зарезервировать этот подарок? Вы берете на себя обязательство купить его полностью.')) return;
    
    try {
      await api.reserveGift(giftId, contributorEmail || undefined);
      toast.success('Подарок зарезервирован!');
      confetti({ particleCount: 100, spread: 70 });
      loadWishlist();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleContribute = async () => {
    if (!selectedGift) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Пожалуйста, войдите в аккаунт, чтобы сделать вклад');
      setTimeout(() => window.location.href = '/register', 1500);
      return;
    }
    
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error('Минимальный вклад 100₽');
      return;
    }

    setIsContributing(true);
    try {
      const result = await api.contributeToGift(selectedGift.id, {
        amount,
        contributor_email: contributorEmail || undefined
      });
      
      toast.success(`Вклад ${amount}₽ добавлен!`);
      if (result.is_complete) {
        confetti({ particleCount: 200, spread: 100 });
      }
      
      setSelectedGift(null);
      setContributionAmount('');
      setContributorEmail('');
      loadWishlist();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsContributing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Ссылка скопирована!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#022c22]">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#022c22] text-emerald-50 p-6">
        <Gift className="w-16 h-16 mb-4 opacity-20 text-gold-500" />
        <h1 className="text-3xl font-serif font-bold mb-2">Свиток не найден</h1>
        <p className="text-emerald-400/70 mb-8 text-center max-w-xs">Возможно, этот список был скрыт густым туманом или удален владельцем.</p>
        <button onClick={() => window.location.href = '/profile'} className="btn-primary px-8">Вернуться в профиль</button>
      </div>
    );
  }

  const theme = getTheme(wishlist.theme);

  return (
    <div className="min-h-screen bg-[#022c22] text-emerald-50 selection:bg-gold-500/30">
      <Header />
      
      <ThemeAnimations animation={theme.animation} />
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `url(${theme.background})`, backgroundSize: 'cover' }} />
      <div className="fixed inset-0 z-[1] bg-emerald-950/80 pointer-events-none" />
      
      <main className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <button 
          onClick={() => window.location.href = '/profile'}
          className="flex items-center gap-2 text-emerald-300 hover:text-gold-400 transition-all font-bold uppercase tracking-widest text-[10px] mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Назад в профиль
        </button>

        <div className="flat-card p-8 md:p-12 mb-12 bg-emerald-900/60 backdrop-blur-xl border-gold-500/20 overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="text-9xl">{theme.emoji}</span>
           </div>
           
           <div className="relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                 <div className="bg-gold-500/10 text-gold-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gold-500/30 shadow-inner">
                    Магический список
                 </div>
                 {wishlist.deadline && (
                    <div className="bg-emerald-950/60 text-emerald-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-800">
                       <Calendar className="w-3.5 h-3.5" /> До {new Date(wishlist.deadline).toLocaleDateString('ru-RU')}
                    </div>
                 )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-gold-200 drop-shadow-lg">{wishlist.title}</h1>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/40 shadow-inner">
                    <span className="text-sm font-bold text-gold-400">{wishlist.owner_username?.[0].toUpperCase()}</span>
                 </div>
                 <div>
                    <p className="text-sm font-bold text-emerald-50">@{wishlist.owner_username}</p>
                    <a href={`mailto:${wishlist.owner_email}`} className="text-[10px] text-emerald-400/70 hover:text-gold-400 transition-colors flex items-center gap-1">
                       <Mail className="w-3 h-3" /> {wishlist.owner_email} (связаться по оплате)
                    </a>
                 </div>
              </div>
              
              {wishlist.description && (
                <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed font-medium">{wishlist.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 items-end">
                 <div className="flex flex-col flex-1 min-w-[200px] bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Собрано магии</span>
                    <div className="flex items-center gap-4">
                       <span className="text-3xl font-serif font-bold text-gold-400">{Math.round(wishlist.completion_percentage)}%</span>
                       <div className="flex-1 h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${wishlist.completion_percentage}%` }} />
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-emerald-800 hover:bg-gold-500 hover:text-emerald-950 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg border border-emerald-700 h-[76px]"
                 >
                    {copied ? <><Check className="w-4 h-4" /> Скопировано</> : <><Share2 className="w-4 h-4" /> Поделиться</>}
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(wishlist.gifts || []).map((gift) => (
            <motion.div 
              key={gift.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flat-card flex flex-col group overflow-hidden bg-emerald-900/40 border-gold-500/10 hover:border-gold-500/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-emerald-950">
                <img 
                  src={gift.image_url || 'https://images.unsplash.com/photo-1513885535751-8b9238bd3021?w=500&q=80'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={gift.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513885535751-8b9238bd3021?w=500&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />
                {gift.is_reserved && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-6 text-center z-20">
                    <div className="animate-in zoom-in duration-500">
                       <div className="w-16 h-16 bg-gold-500 text-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                          <Check className="w-8 h-8" />
                       </div>
                       <p className="font-serif font-bold text-xl text-gold-300 drop-shadow-md">Уже исполнено</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-10 -mt-8">
                <div className="mb-4 min-h-[80px]">
                  <h3 className="text-xl font-serif font-bold mb-1 line-clamp-2 leading-tight text-emerald-50 text-contrast-shadow break-words">{gift.title}</h3>
                  <p className="text-2xl font-black text-gold-400 drop-shadow-md">
                    {gift.price > 0 ? `${gift.price.toLocaleString()} ₽` : 'Бесценно'}
                  </p>
                </div>
                
                <div className="mt-auto space-y-6">
                  {gift.price > 0 && (
                    <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-800/50">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                        <span>Собрано пыльцы</span>
                        <span className="text-gold-300">{Math.round(gift.progress_percentage)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-gold-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                          style={{ width: `${gift.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!gift.is_reserved && (
                    <div className={gift.price > 0 ? "grid grid-cols-2 gap-3" : "w-full"}>
                      <button 
                        onClick={() => handleReserve(gift.id)}
                        className="py-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all flex items-center justify-center gap-2 shadow-inner w-full"
                      >
                        <Heart className="w-4 h-4" /> Забрать {gift.price === 0 && 'целью'}
                      </button>
                      {gift.price > 0 && (
                        <button 
                          onClick={() => setSelectedGift(gift)}
                          className="btn-primary py-3.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" /> Помочь
                        </button>
                      )}
                    </div>
                  )}

                  {gift.url && !gift.is_reserved && (
                    <a 
                      href={gift.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white/5 border border-emerald-800/50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-300 hover:bg-gold-500 hover:text-emerald-950 hover:border-gold-500 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Изучить вещь
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(!wishlist.gifts || wishlist.gifts.length === 0) && (
            <div className="col-span-full py-32 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mb-6 border border-gold-500/20">
                  <Gift className="w-12 h-12 text-gold-400/50" />
               </div>
               <h2 className="text-3xl font-serif font-bold text-emerald-50 mb-4">В этом лесу пока тихо</h2>
               <p className="text-emerald-300/80 mb-10 max-w-md text-lg">Владелец ещё не успел добавить свои желания. Попробуйте зайти позже!</p>
               <button onClick={() => window.location.href = '/profile'} className="btn-primary px-8">Вернуться в профиль</button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedGift && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md"
              onClick={() => setSelectedGift(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-emerald-900 border border-gold-500/30 shadow-2xl p-8 md:p-12 rounded-[2rem] relative z-10 max-w-md w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />
              
              <h3 className="text-3xl font-serif font-bold mb-2 text-gold-300">Помочь мечте</h3>
              <p className="text-emerald-200/70 text-sm mb-8">Вы вносите магическую пыльцу для: <span className="font-bold text-emerald-50 block mt-1">{selectedGift.title}</span></p>
              
              <div className="space-y-6 mb-8 relative z-10">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                    Количество пыльцы (мин. 100₽)
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-gold-500/50">₽</span>
                    <input 
                      type="number"
                      min="100"
                      autoFocus
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-emerald-950 border border-emerald-800 rounded-2xl py-4 pl-12 pr-5 text-gold-400 text-2xl font-black focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                    Ваш вестник (Email)
                  </label>
                  <input 
                    type="email"
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    placeholder="owl@forest.com"
                    className="input-field bg-emerald-950 border-emerald-800 text-emerald-50 rounded-xl"
                  />
                  <p className="text-[10px] text-emerald-500 mt-2 italic">Владелец списка не увидит ваш адрес, это только для заклинания уведомлений.</p>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => setSelectedGift(null)}
                  className="flex-1 py-4 bg-emerald-950 text-emerald-400 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all border border-emerald-800"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleContribute}
                  disabled={isContributing}
                  className="flex-1 btn-primary py-4 text-xs"
                >
                  {isContributing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Сотворить магию'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
