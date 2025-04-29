// Тип для представления цвета (RGB)
export type Color = {
  r: number;
  g: number;
  b: number;
  a?: number; // Альфа-канал для непрозрачности цвета (0-255)
};

// Тип для представления камеры на холсте
export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

// Перечисление типов слоев
export const enum LayerType {
  Rectangle,
  Ellipse,
  Triangle,
  Path,
  Text,
  Frame,
  Image,
}

// Тип для слоя прямоугольника
export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color | null;
  stroke: Color | null;
  opacity: number;
  cornerRadius?: number;
  blendMode?: string;
  strokeWidth?: number;
};

// Тип для слоя эллипса
export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color | null;
  stroke: Color | null;
  opacity: number;
  blendMode?: string;
  strokeWidth?: number;
};

// Тип для слоя эллипса
export type TriangleLayer = {
  type: LayerType.Triangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color | null;
  stroke: Color | null;
  opacity: number;
  blendMode?: string;
  strokeWidth?: number;
};

// Тип для слоя пути
export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color | null;
  opacity: number;
  points: number[][];
  blendMode?: string;
  strokeWidth?: number;
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
  lineHeight: number; // Коэффициент интерлиньяжа (например, 1.2)
  letterSpacing: number;
  fill: Color;
  stroke: Color | null;
  opacity: number;
  isFixedSize: boolean;
  blendMode?: string;
  strokeWidth?: number;
};

// Тип для слоя рамки
export type FrameLayer = {
  type: LayerType.Frame;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color | null;
  stroke: Color | null;
  opacity: number;
  cornerRadius?: number;
  blendMode?: string;
  strokeWidth?: number;
  childIds?: string[]; // Массив ID дочерних слоев
};

// Тип для слоя изображения
export type ImageLayer = {
  type: LayerType.Image;
  x: number;
  y: number;
  height: number;
  width: number;
  opacity: number;
  url: string; // URL изображения
  aspectRatio: number; // Соотношение сторон изображения
  blendMode?: string;
};

// Типы для всех возможных слоев
export type Layer =
  | RectangleLayer
  | EllipseLayer
  | TriangleLayer
  | PathLayer
  | TextLayer
  | FrameLayer
  | ImageLayer;

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
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Frame | LayerType.Image;
      imageData?: {
        url: string;
        width: number;
        height: number;
        aspectRatio: number;
      };
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
      isShiftPressed: boolean;
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
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Frame | LayerType.Image;
      origin: Point;
      current?: Point;
      isClick: boolean;
      isShiftPressed: boolean;
      position: { x: number; y: number; width: number; height: number };
      imageData?: {
        url: string;
        width: number;
        height: number;
        aspectRatio: number;
      };
    };

// Перечисление различных режимов работы с холстом
export const enum CanvasMode {
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

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  thumbnail: string;
  layers: Record<string, Layer>;
  rootLayerIds: string[];
}

export enum TemplateCategory {
  BusinessCard = "Визитки",
  Poster = "Постеры",
  Logo = "Логотипы",
  Document = "Документы",
  Presentation = "Презентации",
  SocialMedia = "Социальные сети"
}

export interface TemplatesState {
  isLoading: boolean;
  error: string | null;
  templates: Template[];
  categories: TemplateCategory[];
}

// Типы для системы обучения
export interface TutorialLesson {
  id: string;
  title: string;
  content: string;
  completed?: boolean;
}

export interface TutorialTopic {
  id: string;
  title: string;
  lessons: TutorialLesson[];
}

export interface TutorialCourse {
  id: string;
  title: string;
  description: string;
  iconPath: string;
  level: 'начинающий' | 'средний' | 'продвинутый';
  duration: string;
  topics: TutorialTopic[];
  lessonsCount: number;
  completedLessons?: number;
  isNew?: boolean;
}

// Перечисление методов генерации палитры
export enum PaletteGenerationMethod {
  Auto = "Автоматический",
  Monochromatic = "Монохромный",
  Analogous = "Аналоговый",
  Complementary = "Комплементарный",
  SplitComplementary = "Сплит-комплементарный",
  Triadic = "Триада",
  Tetradic = "Тетрада"
}

// Тип для представления цвета палитры
export type PaletteColor = {
  hex: string;
  locked: boolean;
};

// Тип для представления палитры
export type Palette = {
  colors: PaletteColor[];
  method: PaletteGenerationMethod;
};

// Тип для события с данными изображения
export type ImageDataEvent = {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
};
