/**
 * Глобальные декларации типов
 * Расширяет глобальные интерфейсы для доступа к данным изображений
 */

// Расширяем глобальный интерфейс Window для доступа к imageData
declare global {
  interface Window {
    imageData?: {
      url: string;
      width: number;
      height: number;
      aspectRatio: number;
    };
  }
}

// Export an empty object to make this a proper ES module
export {};
