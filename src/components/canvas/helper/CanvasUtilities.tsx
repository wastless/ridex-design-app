/*** Компонент для других утилит и функций ***/

import { useCanvas } from "~/components/canvas/helper/CanvasContext";

export function useCanvasUtilities() {
  const { setState, MAX_LAYERS } = useCanvas();


  return {  };
}
