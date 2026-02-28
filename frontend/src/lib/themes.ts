export interface Theme {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  background: string;
  animation: 'snow' | 'hearts' | 'balloons' | 'sparkles' | 'presents' | 'none';
}

const themes: Record<string, Theme> = {
  birthday: {
    id: 'birthday',
    name: 'День рождения',
    emoji: '🎂',
    colors: { primary: '#ec4899', secondary: '#f43f5e', accent: '#fbcfe8', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    background: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&q=80',
    animation: 'presents'
  },
  new_year: {
    id: 'new_year',
    name: 'Новый год',
    emoji: '🎄',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#a7f3d0', gradient: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' },
    background: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80',
    animation: 'snow'
  },
  wedding: {
    id: 'wedding',
    name: 'Свадьба',
    emoji: '💍',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#ddd6fe', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
    background: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
    animation: 'hearts'
  },
  other: {
    id: 'other',
    name: 'Другая',
    emoji: '✨',
    colors: {
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#475569',
      gradient: 'linear-gradient(135deg, #94a3b8 50%, #475569 100%)'
    },
    background: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1920&q=80',
    animation: 'sparkles'
  }
};

export const getTheme = (themeId: string): Theme => {
  return themes[themeId] || themes.birthday;
};

export const getAllThemes = (): Theme[] => {
  return Object.values(themes);
};
