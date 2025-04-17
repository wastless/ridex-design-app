'use client';

import { googleFonts } from '~/data/fonts';
import { fontWeights } from '~/data/fontWeights';
import { useEffect } from 'react';

export function FontLoader() {
  useEffect(() => {
    // Создаем ссылку на Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    
    // Формируем URL для загрузки шрифтов с их начертаниями
    const fontFamilies = googleFonts.map(font => {
      const weights = fontWeights[font.value as keyof typeof fontWeights];
      return `${font.value.replace(/\s+/g, '+')}:wght@${weights.join(';')}`;
    }).join('|');
    
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
    
    // Добавляем ссылку в head документа
    document.head.appendChild(link);
    
    // Очищаем при размонтировании
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
} 