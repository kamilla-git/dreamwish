'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await api.getPublicWishlist(slug as string);
      setWishlist(data);
    } catch (err: any) {
      if (err.message.includes('403') || err.message.includes('приватный')) {
        toast.error('Этот список приватный. Пожалуйста, войдите.');
        setTimeout(() => router.push('/login'), 2000);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useSocket(slug as string, useCallback((event: any) => {
    if (event.type === 'gift_reserved' || event.type === 'contribution_added') {
      loadWishlist();
    }
  }, [loadWishlist]));

  const handleReserve = async (giftId: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Пожалуйста, зарегистрируйтесь, чтобы зарезервировать подарок');
      setTimeout(() => router.push('/register'), 1500);
      return;
    }
    if (!confirm('Зарезервировать этот подарок?')) return;
    try {
      await api.reserveGift(giftId);
      toast.success('Подарок зарезервирован!');
      confetti({ particleCount: 100, spread: 70 });
      loadWishlist();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleContribute = async () => {
    if (!selectedGift) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Пожалуйста, войдите в аккаунт, чтобы сделать вклад');
      setTimeout(() => router.push('/register'), 1500);
      return;
    }
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < 100) { toast.error('Минимальный вклад 100₽'); return; }
    setIsContributing(true);
    try {
      const result = await api.contributeToGift(selectedGift.id, { amount, contributor_email: contributorEmail || undefined });
      toast.success(`Вклад ${amount}₽ добавлен!`);
      if (result.is_complete) confetti({ particleCount: 200, spread: 100 });
      setSelectedGift(null);
      setContributionAmount('');
      loadWishlist();
    } catch (err: any) { toast.error(err.message); } finally { setIsContributing(false); }
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
        <Gift className="w-12 h-12 mb-4 opacity-20 text-gold-500" />
        <h1 className="text-2xl font-serif font-bold mb-2">Свиток не найден</h1>
        <button onClick={() => router.push('/profile')} className="btn-primary mt-6">В профиль</button>
      </div>
    );
  }

  const theme = getTheme(wishlist.theme);

  return (
    <div className="min-h-screen bg-[#022c22] text-emerald-50 selection:bg-gold-500/30 overflow-x-hidden">
      <Header />
      <ThemeAnimations animation={theme.animation} />
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: `url(${theme.background})`, backgroundSize: 'cover' }} />
      <div className="fixed inset-0 z-[1] bg-emerald-950/80 pointer-events-none" />
      
      <main className="relative z-10 pt-20 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <button 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-emerald-300 hover:text-gold-400 transition-all font-bold uppercase tracking-widest text-[9px] mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Назад
        </button>

        {/* Wishlist Hero - Mobile Optimized */}
        <div className="flat-card p-6 md:p-12 mb-8 bg-emerald-900/60 backdrop-blur-xl border-gold-500/20 overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
              <span className="text-7xl md:text-9xl">{theme.emoji}</span>
           </div>
           
           <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                 <div className="bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gold-500/30 shadow-inner">
                    Магический список
                 </div>
                 {wishlist.deadline && (
                    <div className="bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-800">
                       <Calendar className="w-3 h-3" /> До {new Date(wishlist.deadline).toLocaleDateString('ru-RU')}
                    </div>
                 )}
              </div>
              
              <h1 className="text-3xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-gold-200 break-words">{wishlist.title}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/40 shadow-inner">
                    <span className="text-xs font-bold text-gold-400">{wishlist.owner_username?.[0].toUpperCase()}</span>
                 </div>
                 <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-50 truncate">@{wishlist.owner_username}</p>
                    <a href={`mailto:${wishlist.owner_email}`} className="text-[9px] text-emerald-400/70 hover:text-gold-400 transition-colors flex items-center gap-1">
                       <Mail className="w-2.5 h-2.5" /> Связаться по оплате
                    </a>
                 </div>
              </div>
              
              {wishlist.description && (
                <p className="text-sm md:text-lg text-emerald-100/80 mb-8 leading-relaxed line-clamp-3 md:line-clamp-none">{wishlist.description}</p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex flex-col flex-1 bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/50">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Собрано магии</span>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-serif font-bold text-gold-400">{Math.round(wishlist.completion_percentage)}%</span>
                       <div className="flex-1 h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-gold-400" style={{ width: `${wishlist.completion_percentage}%` }} />
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-gold-500 hover:text-emerald-950 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg border border-emerald-700"
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? 'Скопировано' : 'Поделиться'}
                 </button>
              </div>
           </div>
        </div>

        {/* Gifts Grid - Mobile Optimized (1 column on xs, 2 on sm, 3 on lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {(wishlist.gifts || []).map((gift) => (
            <motion.div 
              key={gift.id}
              className="flat-card flex flex-col group overflow-hidden bg-emerald-900/40 border-gold-500/10"
            >
              <div className="relative aspect-video sm:aspect-[4/3] overflow-hidden bg-emerald-950">
                <img 
                  src={gift.image_url || 'https://images.unsplash.com/photo-1513885535751-8b9238bd3021?w=500&q=80'} 
                  className="w-full h-full object-cover" 
                  alt={gift.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513885535751-8b9238bd3021?w=500&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />
                {gift.is_reserved && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-center z-20">
                    <div className="flex flex-col items-center">
                       <div className="w-10 h-10 bg-gold-500 text-emerald-950 rounded-full flex items-center justify-center mb-2 shadow-lg">
                          <Check className="w-5 h-5" />
                       </div>
                       <p className="font-serif font-bold text-base text-gold-300">Исполнено</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col relative z-10 -mt-6">
                <div className="mb-4 min-h-[60px]">
                  <h3 className="text-lg font-serif font-bold mb-1 line-clamp-2 leading-tight text-emerald-50 break-words">{gift.title}</h3>
                  <p className="text-xl font-black text-gold-400">
                    {gift.price > 0 ? `${gift.price.toLocaleString()} ₽` : 'Бесценно'}
                  </p>
                </div>
                
                <div className="mt-auto space-y-4">
                  {gift.price > 0 && (
                    <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-800/50">
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                        <span>Сбор</span>
                        <span className="text-gold-300">{Math.round(gift.progress_percentage)}%</span>
                      </div>
                      <div className="h-1 w-full bg-emerald-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-400" style={{ width: `${gift.progress_percentage}%` }} />
                      </div>
                    </div>
                  )}

                  {!gift.is_reserved && (
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleReserve(gift.id)}
                        className="py-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:text-gold-400 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5" /> Резерв
                      </button>
                      {gift.price > 0 && (
                        <button 
                          onClick={() => setSelectedGift(gift)}
                          className="btn-primary py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Скинуться
                        </button>
                      )}
                    </div>
                  )}

                  {gift.url && !gift.is_reserved && (
                    <a 
                      href={gift.url} target="_blank" rel="noopener noreferrer"
                      className="w-full py-2.5 bg-white/5 border border-emerald-800/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-300 text-center block"
                    >
                      Магазин
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {(!wishlist.gifts || wishlist.gifts.length === 0) && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
               <Gift className="w-10 h-10 text-gold-400/20 mb-4" />
               <h2 className="text-xl font-serif font-bold text-emerald-50">В этом лесу пока тихо</h2>
               <button onClick={() => router.push('/profile')} className="btn-primary mt-6 text-xs">Вернуться</button>
            </div>
          )}
        </div>
      </main>

      {/* Contribution Modal */}
      <AnimatePresence>
        {selectedGift && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm" onClick={() => setSelectedGift(null)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-emerald-900 border-t sm:border border-gold-500/30 shadow-2xl p-6 md:p-10 rounded-t-[2rem] sm:rounded-[2rem] relative z-10 w-full max-w-md">
              <h3 className="text-2xl font-serif font-bold mb-2 text-gold-300">Помочь мечте</h3>
              <p className="text-emerald-200/70 text-xs mb-6 truncate">{selectedGift.title}</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Сумма (₽)</label>
                  <input type="number" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} placeholder="1000" className="w-full bg-emerald-950 border border-emerald-800 rounded-xl py-4 px-5 text-gold-400 text-2xl font-black focus:outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Ваш Email (для уведомлений)</label>
                  <input type="email" value={contributorEmail} onChange={(e) => setContributorEmail(e.target.value)} placeholder="owl@forest.com" className="input-field text-xs" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedGift(null)} className="flex-1 py-4 bg-emerald-950 text-emerald-400 rounded-full font-bold text-[10px] uppercase border border-emerald-800">Отмена</button>
                <button onClick={handleContribute} disabled={isContributing} className="flex-1 btn-primary py-4 text-[10px]">
                  {isContributing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Сотворить магию'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
