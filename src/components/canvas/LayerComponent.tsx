/*** Компонент для рендеринга слоя в зависимости от его типа ***/

import {useSelf, useStorage} from "@liveblocks/react";
import {memo, useState} from "react";
import { CanvasMode, LayerType } from "~/types";
import Rectangle from "./shapes/Rectangle";
import Ellipse from "./shapes/Ellipse";
import Text from "./shapes/Text";
import Path from "./shapes/Path";
import { colorToCss } from "~/utils";

const LayerComponent = memo(
  ({
    id,
    onLayerPointerDown,
    canvasMode,
  }: {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    canvasMode: CanvasMode;
  }) => {
    // Получение данных слоя из хранилища по его id
    const layer = useStorage((root) => root.layers.get(id));

    // Если слой отсутствует, ничего не рендерим
    if (!layer) {
      return null;
    }

    // Получение id выбранного слоя
    const soleLayerId = useSelf((me) =>
        me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );
    const [isSelectionBoxVisible, setIsSelectionBoxVisible] = useState(true);

    // Рендеринг слоя в зависимости от типа
    switch (layer.type) {
      // Рендеринг прямоугольника
      case LayerType.Rectangle:
        return (
          <Rectangle
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
          />
        );

      // Рендеринг эллипса
      case LayerType.Ellipse:
        return (
          <Ellipse
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
          />
        );

      // Рендеринг пути
      case LayerType.Path:
        return (
          <Path
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            points={layer.points}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#000"}
            stroke={layer.stroke ? colorToCss(layer.stroke) : "#000"}
            opacity={layer.opacity}
          />
        );

      // Рендеринг текста
      case LayerType.Text:
        return (
          <Text
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}

          />
        );

      // В случае неизвестного типа слоя выводим предупреждение
      default:
        console.warn("Неизвестный тип слоя");
        return null;
    }
  },
);

// Явно указываем имя компонента
LayerComponent.displayName = "LayerComponent";

export default LayerComponent;
