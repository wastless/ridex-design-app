import React, { useState, useEffect } from 'react';
import { Camera, Point, XYWH } from '~/types';

// Определение типов для информации о событиях указателя
interface TLPointerEventInfo {
  originPagePoint: Point;
  currentPagePoint: Point;
  altKey: boolean;
  zoomLevel: number;
  currentScreenPoint: Point;
}

interface ZoomToolProps {
  camera: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
}

const ZoomTool: React.FC<ZoomToolProps> = ({ camera, setCamera }) => {
  const [zoomBrush, setZoomBrush] = useState<XYWH | null>(null);
  const [info, setInfo] = useState<TLPointerEventInfo | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!info) return;
      const transformedPoint = getTransformedPoint({ x: e.pageX, y: e.pageY }, camera);
      updateZoomBrush(info.originPagePoint, transformedPoint);
    };

    const handlePointerUp = () => {
      if (!info) return;
      completeZoom();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [info, camera]);

  const updateZoomBrush = (origin: Point, current: Point) => {
    setZoomBrush({
      x: Math.min(origin.x, current.x),
      y: Math.min(origin.y, current.y),
      width: Math.abs(current.x - origin.x),
      height: Math.abs(current.y - origin.y),
    });
  };

  const completeZoom = () => {
    if (!zoomBrush || !info) return;
    const threshold = 8 / info.zoomLevel;
    if (zoomBrush.width < threshold && zoomBrush.height < threshold) {
      const point = info.currentScreenPoint;
      if (info.altKey) {
        setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
      } else {
        setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
      }
    } else {
      const targetZoom = info.altKey ? camera.zoom / 2 : camera.zoom * 2;
      setCamera((camera) => ({ ...camera, zoom: targetZoom, x: zoomBrush.x, y: zoomBrush.y }));
    }
    setZoomBrush(null);
    setInfo(null);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const transformedPoint = getTransformedPoint({ x: e.pageX, y: e.pageY }, camera);
    setInfo({
      originPagePoint: transformedPoint,
      currentPagePoint: transformedPoint,
      altKey: e.altKey,
      zoomLevel: camera.zoom,
      currentScreenPoint: { x: e.clientX, y: e.clientY },
    });
  };

  const zoomIn = () => {
    setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
  };

  const zoomOut = () => {
    setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
  };

  const getTransformedPoint = (point: Point, camera: Camera): Point => {
    return {
      x: (point.x - camera.x) / camera.zoom,
      y: (point.y - camera.y) / camera.zoom,
    };
  };

  return (
      <div onPointerDown={onPointerDown}>
        <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-center justify-center p-2">
          <button onClick={zoomIn} className="mb-2 rounded bg-gray-200 p-2">
            Zoom In
          </button>
          <button onClick={zoomOut} className="rounded bg-gray-200 p-2">
            Zoom Out
          </button>
        </div>
      </div>
  );
};

export default ZoomTool;