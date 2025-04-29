/**
 * Утилиты для работы с cookie на клиентской стороне
 * Предоставляет функции для чтения, записи и удаления cookie
 */

/**
 * Получение значения cookie по имени
 * @param {string} name - Имя cookie
 * @returns {string|null} - Значение cookie или null, если cookie не найдена
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]?.trim();
    // Проверяем, начинается ли cookie с запрашиваемого имени
    if (cookie && cookie.substring(0, name.length + 1) === `${name}=`) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Установка cookie с заданным именем, значением и сроком действия
 * @param {string} name - Имя cookie
 * @param {string} value - Значение cookie
 * @param {number} days - Срок действия в днях
 */
export function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

/**
 * Удаление cookie по имени
 * @param {string} name - Имя cookie для удаления
 */
export function removeCookie(name: string): void {
  if (typeof document === "undefined") return;

  // Устанавливаем пустое значение и срок действия в прошлом
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
