import { useEffect, useState } from "react";
import { Camera, CanvasState } from "~/types";

interface ZoomToolProps {
  camera: Camera;
  setCamera: (camera: (prevCamera: Camera) => Camera) => void;
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
}

export function ZoomTool({
  camera,
  setCamera,
  canvasState,
  setCanvasState,
}: ZoomToolProps) {
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "+") {
          zoomIn();
        } else if (e.key === "-") {
          zoomOut();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setCamera]);

  const zoomIn = () => {
    setCamera((prevCamera) => ({
      ...prevCamera,
      zoom: Math.min(prevCamera.zoom * 1.1, 2),
    }));
  };

  const zoomOut = () => {
    setCamera((prevCamera) => ({
      ...prevCamera,
      zoom: Math.max(prevCamera.zoom * 0.9, 0.5),
    }));
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-center justify-center p-2">
      <button onClick={zoomIn} className="mb-2 rounded bg-gray-200 p-2">
        Zoom In
      </button>
      <button onClick={zoomOut} className="rounded bg-gray-200 p-2">
        Zoom Out
      </button>
    </div>
  );
}
