"use client";

/**
 * Компонент для отключения масштабирования страницы в браузере
 * Предотвращает разные жесты масштабирования на мобильных устройствах и в десктопном браузере
 * Необходим для корректной работы редактора дизайна, где масштабирование страницы нежелательно
 */

import { useEffect } from "react";

/**
 * Компонент ClientScripts блокирует нежелательные жесты масштабирования
 * Не имеет визуального представления, работает только на уровне событий
 */
export default function ClientScripts() {
  useEffect(() => {
    /**
     * Предотвращает масштабирование с помощью колесика мыши при зажатом Ctrl/Cmd
     * @param {WheelEvent} e - Событие прокрутки колесиком мыши
     */
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    /**
     * Предотвращает масштабирование жестом щипка на сенсорных устройствах
     * @param {TouchEvent} e - Событие касания экрана
     */
    const preventPinch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    /**
     * Предотвращает масштабирование жестами на MacOS-устройствах
     * @param {Event} e - Событие жеста масштабирования
     */
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    /**
     * Предотвращает масштабирование двойным тапом на мобильных устройствах
     * Определяет быстрые последовательные касания и блокирует их
     * @param {TouchEvent} e - Событие окончания касания экрана
     */
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Добавление обработчиков событий для всех типов жестов масштабирования
    document.addEventListener("wheel", preventZoom, { passive: false });
    document.addEventListener("touchstart", preventPinch, { passive: false });
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("touchend", preventDoubleTap, false);

    // Удаление обработчиков при размонтировании компонента для предотвращения утечек памяти
    return () => {
      document.removeEventListener("wheel", preventZoom);
      document.removeEventListener("touchstart", preventPinch);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("touchend", preventDoubleTap);
    };
  }, []);

  // Компонент не рендерит никакой UI
  return null;
}
