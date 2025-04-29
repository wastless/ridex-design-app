'use client';

/**
 * Компонент для динамической загрузки шрифтов Google Fonts в приложение.
 * Добавляет ссылку на таблицы стилей Google Fonts в head документа при монтировании
 * и удаляет её при размонтировании компонента.
 * 
 * Использует список шрифтов из файла fonts.ts и их начертания из font-weights.ts.
 */

import { googleFonts } from '~/data/fonts';
import { fontWeights } from '~/data/font-weights';
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
    
    // Очищаем при размонтировании компонента
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Компонент не отображает никакой UI, только загружает шрифты
  return null;
} 