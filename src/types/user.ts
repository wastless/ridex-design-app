export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  password: string | null;
  emailVerified: Date | null;
}

// Упрощенная версия User для UI компонентов
export interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
} 