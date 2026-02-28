'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Пароль должен быть от 6 символов');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      toast.error('Username должен быть от 3 до 20 символов');
      return;
    }
    
    setLoading(true);
    try {
      const data = await api.register(email, password, username);
      localStorage.setItem('token', data.access_token);
      toast.success('Добро пожаловать в лес желаний!');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#022c22] selection:bg-gold-500/30">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-700/20 blur-[120px] rounded-full" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-emerald-300 hover:text-gold-400 transition-all font-bold uppercase tracking-widest text-[10px] z-20">
        <ArrowLeft className="w-4 h-4" /> На главную
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-emerald-950/80 backdrop-blur-xl border border-gold-500/20 shadow-2xl p-10 rounded-[2rem] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="p-4 bg-gold-500/10 rounded-full w-fit mx-auto mb-6 shadow-inner border border-gold-500/20">
            <Leaf className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-emerald-50 shadow-sm">Начните мечтать</h2>
          <p className="text-emerald-300/70 font-medium text-sm mt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" /> Создайте свой первый дневник
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 ml-1">Имя лесного духа (ID)</label>
            <div className="relative group">
              <input 
                type="text" required placeholder="@твой_ник"
                autoFocus
                className="input-field px-5"
                value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace('@', ''))}
                minLength={3} maxLength={20}
              />
            </div>
            <p className="text-[10px] text-emerald-500 ml-1 italic">3-20 симв., только буквы, цифры и _</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 ml-1">Свиток (Email)</label>
            <div className="relative group">
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
              <input 
                type="password" required placeholder="Минимум 6 символов"
                className="input-field px-5"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button disabled={loading} className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Войти в лес <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-emerald-400/80 font-medium text-xs">
          Уже есть дневник? <Link href="/login" className="text-gold-400 hover:text-gold-300 hover:underline underline-offset-4">Открыть</Link>
        </p>
      </motion.div>
    </div>
  );
}
