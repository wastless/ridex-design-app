/**
 * Утилита для рекурсивного клонирования React компонентов
 * Позволяет добавлять дополнительные свойства к компонентам на любом уровне вложенности
 */

import * as React from "react";

type AdditionalProps = Record<string, unknown>;

/**
 * Рекурсивно клонирует дочерние компоненты React, добавляя дополнительные пропсы
 * к компонентам с совпадающими displayName.
 *
 * @param children - Дочерние узлы для клонирования
 * @param additionalProps - Дополнительные свойства для добавления к совпадающим компонентам
 * @param displayNames - Массив имен компонентов для сравнения
 * @param uniqueId - Уникальный префикс ID от родительского компонента для генерации стабильных ключей
 * @param asChild - Указывает, использует ли родительский компонент компонент Slot
 *
 * @returns Клонированные узлы с добавленными свойствами у соответствующих компонентов
 */
export function recursiveCloneChildren(
  children: React.ReactNode,
  additionalProps: AdditionalProps,
  displayNames: string[],
  uniqueId: string,
  asChild?: boolean,
): React.ReactNode | React.ReactNode[] {
  const mappedChildren = React.Children.map(
    children,
    (child: React.ReactNode, index) => {
      // Если узел не является валидным элементом React, возвращаем его без изменений
      if (!React.isValidElement(child)) {
        return child;
      }

      // Получаем displayName компонента или пустую строку, если он не определен
      const componentType = child.type as React.ComponentType;
      const displayName: string = (typeof componentType === 'function' && 
        typeof componentType.displayName === 'string' ? 
        componentType.displayName : 
        ''
      );

      // Если displayName компонента находится в списке искомых, добавляем свойства
      const newProps = displayNames.includes(displayName)
        ? additionalProps
        : {};

      // Добавляем явную типизацию для props
      type ChildProps = {
        children?: React.ReactNode;
        asChild?: boolean;
      };
      
      const childProps = (child as React.ReactElement<ChildProps>).props;

      const children = childProps?.children;

      // Клонируем элемент с новыми свойствами и рекурсивно обрабатываем его дочерние элементы
      return React.cloneElement(
        child,
        { ...newProps, key: `${uniqueId}-${index}` },
        children !== null && children !== undefined
          ? recursiveCloneChildren(
              children as React.ReactNode,
              additionalProps,
              displayNames,
              uniqueId,
              Boolean(childProps?.asChild),
            )
          : undefined
      );
    },
  );

  // Если asChild=true, возвращаем только первый дочерний элемент
  // В противном случае возвращаем все клонированные дочерние элементы
  return asChild ? mappedChildren?.[0] : mappedChildren;
}
