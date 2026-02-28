'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Gift, LogIn, UserPlus, LogOut, User as UserIcon, Menu, X, Globe, Sparkles, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
    setIsOpen(false);
    setShowAccountMenu(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 h-16 flex items-center glass-header px-6">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gradient-to-br from-gold-400 to-amber-600 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-gold-400/20">
            <Gift className="w-5 h-5 text-emerald-950" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase italic neon-text-gradient pr-2 block overflow-visible">DreamWish</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/ideas" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${pathname === '/ideas' ? 'text-gold-400' : 'text-emerald-200 hover:text-gold-400'}`}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Библиотека идей
          </Link>
          
          {isAuth ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className={`text-[11px] font-black uppercase tracking-widest transition-colors ${pathname === '/dashboard' ? 'text-gold-400' : 'text-emerald-200 hover:text-gold-400'}`}>
                Мои желания
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 bg-emerald-900/40 border border-gold-400/20 px-3 py-1.5 rounded-full hover:bg-emerald-800 transition-all"
                >
                  <div className="w-6 h-6 bg-gold-400/10 rounded-full flex items-center justify-center border border-gold-400/20">
                    <UserIcon className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gold-500 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-48 bg-emerald-950 border border-gold-400/20 rounded-2xl shadow-2xl p-2 overflow-hidden"
                    >
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-emerald-100 hover:bg-emerald-900 rounded-xl transition-colors">
                        <UserIcon className="w-4 h-4 text-gold-400" /> Профиль
                      </Link>
                      <Link href="/explore" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-emerald-100 hover:bg-emerald-900 rounded-xl transition-colors">
                        <Globe className="w-4 h-4 text-teal-400" /> Лента мира
                      </Link>
                      <div className="h-px bg-gold-400/10 my-1 mx-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Выйти
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/register" className="btn-primary text-[10px] py-2 px-6 shadow-none border-none">
                Начать
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-gold-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-72 bg-emerald-950 border-l border-gold-400/20 z-[60] p-8 shadow-2xl flex flex-col gap-8"
          >
            <div className="flex justify-between items-center text-gold-400 font-serif italic text-xl">
              <span>DreamWish</span>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link href="/ideas" className="text-sm font-bold text-emerald-100 py-3 border-b border-white/5">Идеи подарков</Link>
              {isAuth ? (
                <>
                  <Link href="/dashboard" className="text-sm font-bold text-emerald-100 py-3 border-b border-white/5">Мои желания</Link>
                  <Link href="/explore" className="text-sm font-bold text-emerald-100 py-3 border-b border-white/5">Лента мира</Link>
                  <Link href="/profile" className="text-sm font-bold text-emerald-100 py-3 border-b border-white/5">Профиль</Link>
                  <button onClick={handleLogout} className="text-sm font-bold text-rose-400 py-3 text-left">Выйти</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-emerald-100 py-3 border-b border-white/5">Войти</Link>
                  <Link href="/register" className="btn-primary text-center mt-4">Создать дневник</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
