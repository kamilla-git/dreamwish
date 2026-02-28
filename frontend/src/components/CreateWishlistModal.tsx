'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles, Lock, Globe, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { getAllThemes, Theme, getTheme } from '@/lib/themes';
import ThemeAnimations from '@/components/ThemeAnimations';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateWishlistModal({ isOpen, onClose, onSuccess }: CreateWishlistModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('birthday');
  const [customThemeName, setCustomThemeName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const themes = getAllThemes();

  const handleCreate = async () => {
    if (!title || !selectedThemeId) {
      toast.error('Заполните все поля');
      return;
    }

    if (selectedThemeId === 'other' && !customThemeName) {
      toast.error('Введите название темы');
      return;
    }

    setLoading(true);
    try {
      await api.createWishlist({
        title,
        description,
        theme: selectedThemeId,
        custom_theme_name: selectedThemeId === 'other' ? customThemeName : null,
        deadline: deadline || undefined,
        is_private: isPrivate
      } as any);

      toast.success('Вишлист успешно создан!');
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setSelectedThemeId('birthday');
    setCustomThemeName('');
    setDeadline('');
    setIsPrivate(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-emerald-900 border border-gold-500/30 shadow-2xl p-8 md:p-10 rounded-[2rem] relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-gold-400 transition-colors z-20">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-10 relative z-10">
              <h2 className="text-3xl font-serif font-bold text-gold-300 mb-4">Новый свиток желаний</h2>
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-gold-400 to-amber-600' : 'bg-emerald-950 border border-emerald-800'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-gold-400 to-amber-600' : 'bg-emerald-950 border border-emerald-800'}`} />
              </div>
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 relative z-10">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Название события</label>
                  <input 
                    type="text"
                    placeholder="Например: День Рождения"
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Описание (опционально)</label>
                  <textarea 
                    placeholder="Расскажите историю своих желаний..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Дата свершения
                    </label>
                    <input 
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 block flex items-center gap-2">
                      Магический барьер (Режим доступа)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        type="button"
                        onClick={() => setIsPrivate(false)}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${!isPrivate ? 'bg-gold-500/10 border-gold-500 text-gold-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-emerald-950 border-emerald-800 text-emerald-500 hover:border-emerald-700'}`}
                       >
                         <Globe className={`w-4 h-4 ${!isPrivate ? 'text-gold-400' : ''}`} />
                         <div className="text-left">
                            <p className="text-xs font-bold uppercase">Публичный</p>
                            <p className="text-[9px] opacity-60 font-medium">Открыт миру</p>
                         </div>
                       </button>
                       <button 
                        type="button"
                        onClick={() => setIsPrivate(true)}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${isPrivate ? 'bg-teal-600/20 border-teal-500 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-emerald-950 border-emerald-800 text-emerald-500 hover:border-emerald-700'}`}
                       >
                         <Lock className={`w-4 h-4 ${isPrivate ? 'text-teal-400' : ''}`} />
                         <div className="text-left">
                            <p className="text-xs font-bold uppercase">Скрытый</p>
                            <p className="text-[9px] opacity-60 font-medium">Только для братства</p>
                         </div>
                       </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!title}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-4 py-4"
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Preview Theme Animation inside modal */}
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-[2rem]">
                   {selectedThemeId && <ThemeAnimations animation={getTheme(selectedThemeId).animation} />}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4 block flex items-center gap-2 relative z-10">
                    <Sparkles className="w-3 h-3 text-gold-400" /> Выберите ауру (Оформление)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-5 rounded-2xl border-2 transition-all text-center relative group overflow-hidden ${
                          selectedThemeId === theme.id
                            ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                            : 'border-emerald-800 bg-emerald-950 hover:border-emerald-600'
                        }`}
                      >
                        <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-500">{theme.emoji}</div>
                        <h3 className={`font-serif font-bold text-xs uppercase tracking-widest ${selectedThemeId === theme.id ? 'text-gold-300' : 'text-emerald-500 group-hover:text-emerald-300'}`}>
                          {theme.name}
                        </h3>
                        {selectedThemeId === theme.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-gold-500 text-emerald-950 rounded-full flex items-center justify-center animate-in zoom-in shadow-lg">
                            <Check className="w-3 h-3 font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedThemeId === 'other' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Своя аура (Название темы)</label>
                    <input 
                      type="text"
                      placeholder="Например: Праздник эльфов"
                      autoFocus
                      value={customThemeName}
                      onChange={(e) => setCustomThemeName(e.target.value)}
                      className="input-field"
                    />
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4 relative z-10">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 hover:text-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={loading || (selectedThemeId === 'other' && !customThemeName)}
                    className="flex-1 btn-primary py-4 text-xs font-bold uppercase tracking-widest shadow-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Сотворить'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

