"use client";

/**
 * Хук для работы с уведомлениями в приложении
 * Реализует систему отображения, добавления и удаления уведомлений
 */

import * as React from "react";

import type { NotificationProps } from "~/components/ui/notification";

const NOTIFICATION_LIMIT = 1; // Максимальное количество одновременно отображаемых уведомлений
const NOTIFICATION_REMOVE_DELAY = 1000000; // Задержка удаления уведомления (в мс)

// Тип уведомления с добавленным идентификатором
type NotificationPropsWithId = NotificationProps & {
  id: string;
};

// Константы для типов действий
type ActionType = {
  ADD_NOTIFICATION: "ADD_NOTIFICATION"; // Добавление уведомления
  UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION"; // Обновление уведомления
  DISMISS_NOTIFICATION: "DISMISS_NOTIFICATION"; // Скрытие уведомления
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION"; // Удаление уведомления
};

let count = 0;

/**
 * Генерирует уникальный идентификатор для уведомления
 * @returns {string} Уникальный идентификатор
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: ActionType["ADD_NOTIFICATION"];
      notification: NotificationPropsWithId;
    }
  | {
      type: ActionType["UPDATE_NOTIFICATION"];
      notification: Partial<NotificationPropsWithId>;
    }
  | {
      type: ActionType["DISMISS_NOTIFICATION"];
      notificationId?: NotificationPropsWithId["id"];
    }
  | {
      type: ActionType["REMOVE_NOTIFICATION"];
      notificationId?: NotificationPropsWithId["id"];
    };

// Состояние хранилища уведомлений
interface State {
  notifications: NotificationPropsWithId[];
}

// Хранение таймеров для удаления уведомлений
const notificationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Добавляет уведомление в очередь на удаление
 * @param {string} notificationId - Идентификатор уведомления
 */
const addToRemoveQueue = (notificationId: string) => {
  if (notificationTimeouts.has(notificationId)) {
    return;
  }

  const timeout = setTimeout(() => {
    notificationTimeouts.delete(notificationId);
    dispatch({
      type: "REMOVE_NOTIFICATION",
      notificationId: notificationId,
    });
  }, NOTIFICATION_REMOVE_DELAY);

  notificationTimeouts.set(notificationId, timeout);
};

/**
 * Редьюсер для управления состоянием уведомлений
 * @param {State} state - Текущее состояние
 * @param {Action} action - Выполняемое действие
 * @returns {State} Новое состояние
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      // Добавляем новое уведомление в начало списка и обрезаем по лимиту
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(
          0,
          NOTIFICATION_LIMIT,
        ),
      };

    case "UPDATE_NOTIFICATION":
      // Обновляем существующее уведомление
      return {
        ...state,
        notifications: state.notifications.map((t) =>
          t.id === action.notification.id
            ? { ...t, ...action.notification }
            : t,
        ),
      };

    case "DISMISS_NOTIFICATION": {
      const { notificationId } = action;

      // Добавляем уведомление(я) в очередь на удаление
      if (notificationId) {
        addToRemoveQueue(notificationId);
      } else {
        state.notifications.forEach((notification) => {
          addToRemoveQueue(notification.id);
        });
      }

      // Помечаем уведомление(я) как закрытые
      return {
        ...state,
        notifications: state.notifications.map((t) =>
          t.id === notificationId || notificationId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_NOTIFICATION":
      // Удаляем указанное уведомление или все уведомления
      if (action.notificationId === undefined) {
        return {
          ...state,
          notifications: [],
        };
      }
      return {
        ...state,
        notifications: state.notifications.filter(
          (t) => t.id !== action.notificationId,
        ),
      };
  }
};

// Список слушателей состояния
const listeners: Array<(state: State) => void> = [];

// Начальное состояние в памяти
let memoryState: State = { notifications: [] };

/**
 * Диспетчер действий для обновления состояния и уведомления слушателей
 * @param {Action} action - Выполняемое действие
 */
function dispatch(action: Action) {
  if (action.type === "ADD_NOTIFICATION") {
    // Предотвращаем дублирование уведомлений с одинаковым ID
    const notificationExists = memoryState.notifications.some(
      (t) => t.id === action.notification.id,
    );
    if (notificationExists) {
      return;
    }
  }
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Тип для создания уведомления
type Notification = Omit<NotificationPropsWithId, "id">;

/**
 * Создает и отображает новое уведомление
 * @param {Notification} props - Свойства уведомления
 * @returns {Object} Объект с методами управления уведомлением
 */
function notification({ ...props }: Notification & { id?: string }) {
  const id = props?.id ?? genId();

  // Функция обновления уведомления
  const update = (props: Notification) =>
    dispatch({
      type: "UPDATE_NOTIFICATION",
      notification: { ...props, id },
    });

  // Функция скрытия уведомления
  const dismiss = () =>
    dispatch({ type: "DISMISS_NOTIFICATION", notificationId: id });

  // Добавляем уведомление в состояние
  dispatch({
    type: "ADD_NOTIFICATION",
    notification: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Хук для работы с уведомлениями в компонентах
 * @returns {Object} Объект с методами и состоянием системы уведомлений
 */
function useNotification() {
  const [state, setState] = React.useState<State>(memoryState);

  // Подписываемся на изменения состояния
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    notification,
    dismiss: (notificationId?: string) =>
      dispatch({ type: "DISMISS_NOTIFICATION", notificationId }),
  };
}

export { notification, useNotification };
