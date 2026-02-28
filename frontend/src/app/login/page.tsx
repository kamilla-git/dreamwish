'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Mail, Lock, LogIn, ArrowLeft, Loader2, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token);
      toast.success('Добро пожаловать в лес желаний!');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#022c22] selection:bg-gold-500/30">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-700/20 blur-[120px] rounded-full" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-emerald-300 hover:text-gold-400 transition-all font-bold uppercase tracking-widest text-[10px] z-20">
        <ArrowLeft className="w-4 h-4" /> На главную
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-emerald-950/80 backdrop-blur-xl border border-gold-500/20 shadow-2xl p-10 rounded-[2rem] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="p-4 bg-gold-500/10 rounded-full w-fit mx-auto mb-6 shadow-inner border border-gold-500/20">
            <Leaf className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-emerald-50">С возвращением</h2>
          <p className="text-emerald-300/70 font-medium text-sm mt-2">Ваши мечты ждут вас</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 ml-1">Свиток (Email)</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 group-focus-within:text-gold-400 transition-all ${email ? 'opacity-0' : 'opacity-100'}`} />
              <input 
                type="email" required placeholder="owl@forest.com"
                className="input-field px-5"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 ml-1">Заклинание (Пароль)</label>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 group-focus-within:text-gold-400 transition-all ${password ? 'opacity-0' : 'opacity-100'}`} />
              <input 
                type="password" required placeholder="••••••••"
                className="input-field px-5"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Войти <LogIn className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-emerald-400/80 font-medium text-xs">
          Нет дневника? <Link href="/register" className="text-gold-400 hover:text-gold-300 hover:underline underline-offset-4">Создать бесплатно</Link>
        </p>
      </motion.div>
    </div>
  );
}

