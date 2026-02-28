'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, User as UserIcon, Mail, Search, UserPlus, Check, X, Users, Loader2, Settings, Bell, ChevronRight, Sparkles, Camera, Edit2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { api, Wishlist } from '@/lib/api';
import { getTheme } from '@/lib/themes';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsWishlists, setFriendsWishlists] = useState<Wishlist[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States for filtering and editing
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditData] = useState({ username: '', avatar_url: '' });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { window.location.href = '/login'; return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, f, r, w] = await Promise.all([
        api.getMe(),
        api.getFriends(),
        api.getFriendRequests(),
        api.getFriendsWishlists()
      ]);
      setProfile(p);
      setFriends(f);
      setRequests(r);
      setFriendsWishlists(w);
      setEditData({ username: p.username, avatar_url: p.avatar_url || '' });
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.updateProfile(editForm);
      toast.success('Профиль обновлен');
      setIsEditing(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка обновления');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) { toast.error('Ошибка поиска'); } finally { setIsSearching(false); }
  };

  const respondToRequest = async (id: number, accept: boolean) => {
    try {
      if (accept) {
        await api.acceptFriendRequest(id);
      } else {
        await api.rejectFriendRequest(id);
      }
      toast.success(accept ? 'Запрос принят' : 'Запрос отклонен');
      loadData();
    } catch (e) { toast.error('Ошибка ответа на запрос'); }
  };

  const sendFriendRequest = async (id: number) => {
    try {
      await api.sendFriendRequest(id);
      toast.success('Запрос отправлен');
      setSearchResults([]);
      setSearchQuery('');
    } catch (e: any) { toast.error(e.message || 'Ошибка отправки'); }
  };

  const filteredWishlists = selectedFriendId 
    ? (friendsWishlists || []).filter(w => w.owner_id === selectedFriendId)
    : (friendsWishlists || []);

  return (
    <div className="min-h-screen bg-[#022c22] text-emerald-50 selection:bg-gold-500/30">
      <Header />
      
      <main className="relative z-10 max-w-6xl mx-auto pt-28 pb-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Profile & Friends */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flat-card p-8 text-center bg-emerald-900/60 border-gold-500/20 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 p-2 bg-emerald-800/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Edit2 className="w-4 h-4 text-gold-400" />
              </button>

              <div className="relative w-24 h-24 mx-auto mb-6 z-10">
                <div className="w-full h-full rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <span className="text-4xl font-serif font-black text-gold-400">{profile?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-emerald-950/80 rounded-full flex items-center justify-center cursor-pointer">
                    <Camera className="w-6 h-6 text-gold-400" />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 relative z-10">
                  <input 
                    className="input-field bg-emerald-950/80 border-emerald-800 text-center text-sm" 
                    value={editForm.username} 
                    onChange={e => setEditData({...editForm, username: e.target.value})}
                    placeholder="Имя лесного духа"
                  />
                  <input 
                    className="input-field bg-emerald-950/80 border-emerald-800 text-center text-xs" 
                    value={editForm.avatar_url} 
                    onChange={e => setEditData({...editForm, avatar_url: e.target.value})}
                    placeholder="URL портрета"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateProfile} className="btn-primary flex-1 py-2 text-xs">Сохранить</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-emerald-950/50 rounded-full text-xs text-emerald-300 border border-emerald-800 hover:bg-emerald-800">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10">
                  <h1 className="text-3xl font-serif font-black tracking-tight mb-1 text-gold-300">@{profile?.username}</h1>
                  <p className="text-emerald-400/70 text-sm mb-6">{profile?.email}</p>
                </div>
              )}
              
              <div className="flex justify-center gap-4 pt-4 border-t border-emerald-800/50 relative z-10">
                <div className="text-center">
                   <p className="text-xl font-serif font-black text-emerald-50">{friends.length}</p>
                   <p className="text-[10px] font-bold uppercase text-emerald-500">Спутников</p>
                </div>
                <div className="w-px h-8 bg-emerald-800/50" />
                <Link href="/explore" className="text-center group/exp">
                   <p className="text-xl font-serif font-black text-emerald-50 group-hover/exp:text-gold-400 transition-colors"><Globe className="w-5 h-5 inline mb-1" /></p>
                   <p className="text-[10px] font-bold uppercase text-emerald-500">Explore</p>
                </Link>
              </div>
            </div>

            {/* Interactive Friends List */}
            <div className="flat-card p-6 bg-emerald-900/40 border-gold-500/10 shadow-xl">
               <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Лесное братство</h3>
                  {selectedFriendId && (
                    <button onClick={() => setSelectedFriendId(null)} className="text-[9px] font-bold text-gold-400 uppercase hover:underline">Весь лес</button>
                  )}
               </div>
               <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                  {friends.map(friend => (
                    <button 
                      key={friend.id} 
                      onClick={() => setSelectedFriendId(friend.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${selectedFriendId === friend.id ? 'bg-gold-500/10 border-gold-500/30 shadow-inner' : 'bg-emerald-950/30 border-transparent hover:bg-emerald-800/50'}`}
                    >
                       <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center overflow-hidden border border-emerald-700">
                          {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xs font-serif font-bold text-gold-400">{friend.username[0].toUpperCase()}</span>}
                       </div>
                       <span className="text-sm font-medium text-emerald-100">@{friend.username}</span>
                       {selectedFriendId === friend.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />}
                    </button>
                  ))}
                  {friends.length === 0 && <p className="text-xs text-emerald-600/80 px-2 italic text-center py-4">Список спутников пуст</p>}
               </div>
            </div>
          </div>

          {/* Right Side: Dynamic Wishlist Feed */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Search Section */}
            <div className="flat-card p-6 bg-emerald-900/40 border-gold-500/10 backdrop-blur-md">
              <h2 className="text-sm font-black uppercase tracking-widest text-gold-400 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Искать духа
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введите имя или метку..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field bg-emerald-950/60 border-emerald-800 text-white placeholder:text-emerald-600 focus:border-gold-500"
                />
                <button onClick={handleSearch} disabled={isSearching} className="btn-primary px-6 text-sm">
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Найти'}
                </button>
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 space-y-2">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center font-serif font-bold text-gold-400 border border-gold-500/20">
                             {user.username[0].toUpperCase()}
                           </div>
                           <div>
                             <p className="font-bold text-sm text-emerald-50">@{user.username}</p>
                             <p className="text-[10px] text-emerald-500">{user.email}</p>
                           </div>
                        </div>
                        <button onClick={() => sendFriendRequest(user.id)} className="px-4 py-2.5 bg-emerald-800 text-gold-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-emerald-950 transition-all flex items-center gap-2">
                          <UserPlus className="w-3.5 h-3.5" /> Призвать
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="flat-card p-6 bg-emerald-900/60 border-gold-500/20">
                <h2 className="text-sm font-black uppercase tracking-widest text-gold-300 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold-400" /> Зов леса (Запросы)
                </h2>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center font-serif font-bold text-gold-400">{req.user.username[0].toUpperCase()}</div>
                         <p className="font-bold text-sm text-emerald-50">@{req.user.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => respondToRequest(req.id, true)} className="p-2.5 bg-gold-500 text-emerald-950 rounded-full hover:bg-gold-400 shadow-md"><Check className="w-4 h-4" /></button>
                        <button onClick={() => respondToRequest(req.id, false)} className="p-2.5 bg-emerald-950 border border-emerald-800 text-rose-400 rounded-full hover:bg-rose-900/30"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Wishlists Feed */}
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-gold-200 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-gold-400" /> 
                    {selectedFriendId ? `Желания @${friends.find(f => f.id === selectedFriendId)?.username}` : 'Свитки желаний братства'}
                  </h2>
                  <Link href="/explore" className="text-xs font-bold text-emerald-400 hover:text-gold-400 transition-colors flex items-center gap-1">Все свитки <ChevronRight className="w-3 h-3"/></Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredWishlists.length > 0 ? filteredWishlists.map(list => (
                    <Link key={list.id} href={`/w/${list.public_slug}`} className="flat-card p-6 bg-emerald-900/40 border-gold-500/10 hover:border-gold-500/40 transition-all group relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <span className="text-6xl">{getTheme(list.theme).emoji}</span>
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-12 transition-transform duration-500">{getTheme(list.theme).emoji}</div>
                             <div className="text-right">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Собрано магии</p>
                                <p className="text-base font-serif font-black text-gold-400">{Math.round(list.completion_percentage)}%</p>
                             </div>
                          </div>
                          <h3 className="text-xl font-serif font-bold text-emerald-50 mb-1 group-hover:text-gold-300 transition-colors">{list.title}</h3>
                          <p className="text-[10px] text-emerald-400/80 mb-3 italic font-medium">от @{list.owner_username}</p>
                          <p className="text-sm text-emerald-200/70 line-clamp-2 leading-relaxed">{list.description || 'Дневник скрывает свои тайны...'}</p>
                       </div>
                    </Link>
                  )) : (
                    <div className="col-span-full py-20 bg-emerald-950/30 rounded-[2rem] border-2 border-dashed border-emerald-800 text-center">
                       <Gift className="w-12 h-12 text-emerald-800 mx-auto mb-4" />
                       <p className="text-emerald-500 font-medium">Лес пока хранит молчание...</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
