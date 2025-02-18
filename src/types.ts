// Тип для представления цвета (RGB)
export type Color = {
  r: number;
  g: number;
  b: number;
};

// Тип для представления камеры на холсте
export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

// Перечисление типов слоев
export enum LayerType {
  Rectangle,
  Ellipse,
  Triangle,
  Path,
  Text,
}

// Тип для слоя прямоугольника
export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
};

// Тип для слоя эллипса
export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
};

// Тип для слоя эллипса
export type TriangleLayer = {
  type: LayerType.Triangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
};


// Тип для слоя пути
export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  points: number[][];
};

// Тип для слоя текста
export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fill: Color;
  stroke: Color | null;
  opacity: number;
  overflow: string;
};

// Типы для всех возможных слоев
export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer;

// Тип для представления точки с координатами X и Y
export type Point = {
  x: number;
  y: number;
};

// Тип для представления области с координатами и размерами (X, Y, ширина, высота)
export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Перечисление сторон (верх, низ, левый, правый)
export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

// Cостояния холста, который может работать в различных режимах
export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.RightClick;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Dragging;
      origin: Point | null;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.CreatingShape;
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text;
      origin: Point;
      current?: Point;
      isClick: boolean;
      isShiftPressed: boolean;
  position: { x: number; y: number; width: number; height: number };
    };

// Перечисление различных режимов работы с холстом
export enum CanvasMode {
  None,
  Dragging,
  Inserting,
  Pencil,
  Resizing,
  Translating,
  SelectionNet,
  Pressing,
  RightClick,
  CreatingShape,
}

