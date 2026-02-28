'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, title = "Вход в аккаунт", message = "Войдите, чтобы продолжить." }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] relative z-10 text-center max-w-sm w-full backdrop-blur-2xl shadow-2xl shadow-indigo-500/10"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="p-4 bg-indigo-500/20 rounded-2xl w-fit mx-auto mb-6">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
            <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">{message}</p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all shadow-xl"
              >
                Войти
              </button>
              <button 
                onClick={() => window.location.href = '/register'}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Зарегистрироваться
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
