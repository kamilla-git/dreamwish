'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Leaf, Trash2, Moon, Sparkles, Wand2, Loader2, ExternalLink, Check, Users, Search, Bell, X, Edit2, ArrowRight, Globe, Plus, Camera } from 'lucide-react';
import { toast } from 'sonner';
// ... rest of imports ...

import Link from 'next/link';
import Background3D from '@/components/3d/Background3D';
import CreateWishlistModal from '@/components/CreateWishlistModal';
import Header from '@/components/layout/Header';
import ThemeAnimations from '@/components/ThemeAnimations';
import { api, Wishlist } from '@/lib/api';
import { getTheme } from '@/lib/themes';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [editingGift, setEditingGift] = useState<{title: string, price: number, image_url: string, url: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadWishlists();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingGift) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 5МБ)');
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
      setEditingGift({ ...editingGift, image_url: fullUrl });
      toast.success('Фото загружено!');
    } catch (err) {
      toast.error('Ошибка загрузки фото');
    } finally {
      setIsUploading(false);
    }
  };

  const loadWishlists = async () => {
    try {
      const data = await api.getMyWishlists();
      setWishlists(data);
      if (data.length > 0 && !selectedWishlist) {
        setSelectedWishlist(data[0]);
      } else if (selectedWishlist) {
        const updated = data.find(w => w.id === selectedWishlist.id);
        if (updated) setSelectedWishlist(updated);
      }
    } catch (err) {
      toast.error('Ошибка загрузки');
    }
  };

  const handleScrape = async () => {
    if (!selectedWishlist) {
      toast.error('Выберите вишлист');
      return;
    }
    if (!url.startsWith('http')) {
      setEditingGift({ title: '', price: 0, image_url: '', url: '' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.scrapeUrl(url);
      setEditingGift({
        title: data.title || '',
        price: data.price || 0,
        image_url: data.image_url || '',
        url: url
      });
      if (!data.success) {
        toast.info('Не удалось загрузить данные автоматически. Введите их вручную.');
      }
    } catch (e: any) {
      setEditingGift({ title: '', price: 0, image_url: '', url: url });
    } finally {
      setIsLoading(false);
    }
  };

  const saveGift = async () => {
    if (!selectedWishlist || !editingGift) return;
    if (!editingGift.title) { toast.error('Введите название'); return; }

    setIsLoading(true);
    try {
      if ((editingGift as any).id) {
        await api.updateGift((editingGift as any).id, editingGift);
        toast.success('Подарок обновлен!');
      } else {
        await api.addGift(selectedWishlist.id, {
          ...editingGift,
          wishlist_id: selectedWishlist.id
        });
        toast.success('Подарок добавлен!');
      }
      loadWishlists();
      setEditingGift(null);
      setUrl('');
    } catch (e) {
      toast.error('Ошибка сохранения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWishlist = async () => {
    if (!selectedWishlist) return;
    if (!confirm(`Вы уверены, что хотите удалить список "${selectedWishlist.title}"? Это действие необратимо.`)) return;

    setIsLoading(true);
    try {
      await api.deleteWishlist(selectedWishlist.id);
      toast.success('Вишлист удален');
      setSelectedWishlist(null);
      loadWishlists();
    } catch (err) {
      toast.error('Ошибка при удалении');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGift = async (gift: any) => {
    if (!confirm('Удалить этот подарок?')) return;
    try {
      await api.deleteGift(gift.id);
      loadWishlists();
      toast.success('Подарок удален');
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const copyPublicLink = (slug: string) => {
    const link = `${window.location.origin}/w/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    toast.success('Ссылка скопирована!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const theme = selectedWishlist ? getTheme(selectedWishlist.theme) : null;

  return (
    <div className="relative min-h-screen text-emerald-50 bg-[#022c22] overflow-x-hidden selection:bg-gold-500/30">
      <Header />
      
      {theme && (
        <>
          <ThemeAnimations animation={theme.animation} />
          <div 
            className="fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none"
            style={{
              backgroundImage: `url(${theme.background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15
            }}
          />
        </>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/60 z-[1]" />
        <Background3D showSpheres={true} />
      </div>
      
      <main className="relative z-10 max-w-7xl mx-auto pt-24 pb-20 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-2 neon-text-gradient">Мои желания</h1>
            <p className="text-emerald-300 font-medium text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" /> Собирайте мечты, делитесь с друзьями
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Leaf className="w-4 h-4" /> Создать список
            </button>
          </div>
        </div>

        {wishlists.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
            {wishlists.map((wl) => (
              <button
                key={wl.id}
                onClick={() => setSelectedWishlist(wl)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                  selectedWishlist?.id === wl.id
                    ? 'bg-gold-500 text-emerald-950 border-gold-400 shadow-inner'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:border-emerald-600 hover:bg-emerald-900/60'
                }`}
              >
                <span>{getTheme(wl.theme).emoji}</span> {wl.title}
              </button>
            ))}
          </div>
        )}

        {selectedWishlist ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="flat-card p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="max-w-[70%]">
                    <h2 className="text-2xl font-serif font-bold text-gold-300 mb-1 truncate">{selectedWishlist.title}</h2>
                    <p className="text-emerald-100/70 text-sm line-clamp-2">{selectedWishlist.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyPublicLink(selectedWishlist.public_slug!)} className="p-2 bg-emerald-950/50 border border-gold-400/20 rounded-full hover:text-gold-400 transition-colors" title="Копировать ссылку">
                      {copiedSlug === selectedWishlist.public_slug ? <Check className="w-4 h-4 text-green-400" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleDeleteWishlist} className="p-2 bg-emerald-950/50 border border-gold-400/20 rounded-full hover:text-rose-400 hover:bg-rose-900/30 transition-colors" title="Удалить вишлист">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-emerald-950/60 p-4 rounded-2xl border border-gold-400/10 text-center shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Всего</p>
                    <p className="text-xl font-serif font-bold text-emerald-50">{selectedWishlist.total_value.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-emerald-950/60 p-4 rounded-2xl border border-gold-400/10 text-center shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Собрано</p>
                    <p className="text-xl font-serif font-bold text-gold-400">{selectedWishlist.total_collected.toLocaleString()} ₽</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="relative">
                      <input 
                        placeholder="Ссылка на товар..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                        className="input-field pr-12 text-sm"
                      />
                      <button onClick={handleScrape} disabled={isLoading} className="absolute right-1.5 top-1.5 p-2 bg-gold-500 text-emerald-950 rounded-lg hover:bg-gold-400 transition-colors">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      </button>
                   </div>
                   <button onClick={() => setEditingGift({title: '', price: 0, image_url: '', url: ''})} className="w-full py-3 bg-emerald-900/40 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-300 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 border border-emerald-700 shadow-inner">
                      <Plus className="w-3 h-3" /> Добавить вручную
                   </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedWishlist.gifts.map((gift) => (
                  <motion.div key={gift.id} layout className="flat-card flex flex-col group overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden bg-emerald-950">
                      <img src={gift.image_url || 'https://images.unsplash.com/photo-1513885535751-8b9238bd3021?w=500&q=80'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={gift.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />
                      {gift.is_reserved && (
                        <div className="absolute top-4 right-4 bg-gold-500 text-emerald-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg shadow-gold-500/40 z-10">Резерв</div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col relative z-10 -mt-8">
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <h3 className="font-serif font-bold text-lg text-emerald-50 line-clamp-2 text-contrast-shadow">{gift.title}</h3>
                        <p className="font-black text-xl text-gold-400 drop-shadow-md whitespace-nowrap">{gift.price.toLocaleString()} ₽</p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-emerald-800/50">
                        <div className="flex gap-2">
                          {gift.url && <a href={gift.url} target="_blank" className="flex-1 py-2.5 bg-emerald-900/50 rounded-xl text-[10px] font-bold uppercase text-center text-emerald-200 hover:bg-gold-500 hover:text-emerald-950 transition-all border border-emerald-700 shadow-inner">В магазин</a>}
                          <button onClick={() => setEditingGift({...gift} as any)} className="p-2.5 bg-emerald-900/50 text-emerald-300 rounded-xl hover:bg-gold-500 hover:text-emerald-950 transition-all border border-emerald-700 shadow-inner">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteGift(gift)} className="p-2.5 bg-rose-900/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-900/30 shadow-inner"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {selectedWishlist.gifts.length === 0 && (
                  <div className="col-span-full py-24 flat-card flex flex-col items-center justify-center text-center">
                    <Leaf className="w-12 h-12 text-gold-400/30 mb-4 animate-pulse-slow" />
                    <p className="text-2xl font-serif font-bold text-emerald-100 mb-2">Здесь пока пусто</p>
                    <p className="text-emerald-400/70 text-sm">Добавьте первое желание в свой дневник!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flat-card p-24 text-center mt-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full" />
            <Gift className="w-16 h-16 text-gold-400/30 mx-auto mb-6 relative z-10" />
            <h2 className="text-4xl font-serif font-bold text-emerald-50 mb-4 relative z-10">Начните магию</h2>
            <p className="text-emerald-300 mb-10 max-w-md mx-auto text-lg relative z-10">Создайте свой первый список желаний и делитесь им.</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary px-12 py-4 text-lg relative z-10">Создать список</button>
          </div>
        )}

        <section className="mt-32 border-t border-emerald-800/50 pt-20 pb-10">
           <div className="flex justify-between items-end mb-12">
              <div>
                 <h2 className="text-3xl font-serif font-bold text-gold-200">Магия других миров</h2>
                 <p className="text-emerald-400 text-sm mt-2">Загляните в открытые дневники других мечтателей</p>
              </div>
              <Link href="/explore" className="text-xs font-black uppercase tracking-[0.2em] text-gold-500 hover:text-gold-300 transition-colors flex items-center gap-2 group">
                 Посмотреть все <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60 hover:opacity-100 transition-opacity">
              <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-800 border-dashed text-center">
                 <Globe className="w-8 h-8 text-emerald-700 mx-auto mb-4" />
                 <p className="text-emerald-500 text-sm font-medium">Здесь появятся превью популярных публичных списков...</p>
              </div>
              <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-800 border-dashed text-center">
                 <Sparkles className="w-8 h-8 text-emerald-700 mx-auto mb-4" />
                 <p className="text-emerald-500 text-sm font-medium">Вдохновляйтесь желаниями со всего мира</p>
              </div>
              <div className="p-8 rounded-3xl bg-emerald-950/40 border border-emerald-800 border-dashed text-center">
                 <Leaf className="w-8 h-8 text-emerald-700 mx-auto mb-4" />
                 <p className="text-emerald-500 text-sm font-medium">Создавайте сообщества по интересам</p>
              </div>
           </div>
        </section>
      </main>

      <CreateWishlistModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={loadWishlists} />

      <AnimatePresence>
        {editingGift && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingGift(null)} className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-emerald-900 border border-gold-500/30 shadow-2xl p-8 rounded-[2rem] relative z-10 max-w-md w-full">
              <h3 className="text-2xl font-serif font-bold text-gold-300 mb-6">Параметры подарка</h3>
              
              <div className="space-y-4 mb-8">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-emerald-950 border border-emerald-800 mb-6 group shadow-inner">
                   {editingGift.image_url ? (
                     <img src={editingGift.image_url} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600">
                        {isUploading ? <Loader2 className="w-10 h-10 mb-2 animate-spin text-gold-500" /> : <Leaf className="w-10 h-10 mb-2 opacity-30" />}
                        <span className="text-[10px] uppercase font-bold tracking-widest">{isUploading ? 'Магия загрузки...' : 'Нет фото'}</span>
                     </div>
                   )}
                   
                   <label className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-4 gap-2">
                      <Camera className="w-8 h-8 text-gold-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Выбрать файл</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                   </label>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald-400 mb-1.5 block">Или прямая ссылка</label>
                  <input 
                    className="input-field text-[10px]"
                    placeholder="https://..."
                    value={editingGift.image_url}
                    onChange={e => setEditingGift({...editingGift, image_url: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald-400 mb-1.5 block">Название</label>
                  <input className="input-field" value={editingGift.title} onChange={e => setEditingGift({...editingGift, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald-400 mb-1.5 block">Цена (₽)</label>
                  <input type="number" className="input-field" value={editingGift.price} onChange={e => setEditingGift({...editingGift, price: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setEditingGift(null)} className="flex-1 py-3 bg-emerald-950 text-emerald-300 rounded-full font-bold text-sm uppercase hover:bg-emerald-800 transition-all border border-emerald-800 shadow-inner">Отмена</button>
                <button onClick={saveGift} disabled={isLoading} className="flex-1 btn-primary py-3 text-sm">{isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Сохранить'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
