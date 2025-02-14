import { Camera } from "~/types";

const MAX_ZOOM = 2; // Максимальный зум
const MIN_ZOOM = 0.5; // Минимальный зум

const animateZoom = (startZoom: number, endZoom: number, setCamera: React.Dispatch<React.SetStateAction<Camera>>) => {
    const duration = 200; // Длительность анимации в миллисекундах
    const startTime = performance.now();

    const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newZoom = startZoom + (endZoom - startZoom) * progress;

        setCamera((prevCamera) => ({ ...prevCamera, zoom: newZoom }));

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
};

export const zoomIn = (setCamera: React.Dispatch<React.SetStateAction<Camera>>) => {
    setCamera((prevCamera) => {
        const newZoom = Math.min(prevCamera.zoom * 1.2, MAX_ZOOM);
        animateZoom(prevCamera.zoom, newZoom, setCamera);
        return prevCamera; // Возвращаем прежнее состояние, чтобы избежать мерцания
    });
};

export const zoomOut = (setCamera: React.Dispatch<React.SetStateAction<Camera>>) => {
    setCamera((prevCamera) => {
        const newZoom = Math.max(prevCamera.zoom / 1.2, MIN_ZOOM);
        animateZoom(prevCamera.zoom, newZoom, setCamera);
        return prevCamera; // Возвращаем прежнее состояние, чтобы избежать мерцания
    });
};

// Функция для установки зума до 100%
export const zoomTo100 = (setCamera: React.Dispatch<React.SetStateAction<Camera>>) => {
    setCamera((prevCamera) => {
        animateZoom(prevCamera.zoom, 1, setCamera);
        return prevCamera; // Возвращаем прежнее состояние, чтобы избежать мерцания
    });
};

// Функция для установки зума, чтобы подогнать содержимое
export const zoomToFit = (setCamera: React.Dispatch<React.SetStateAction<Camera>>, contentWidth: number, contentHeight: number, viewportWidth: number, viewportHeight: number) => {
    const zoom = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight);
    setCamera((prevCamera) => {
        animateZoom(prevCamera.zoom, zoom, setCamera);
        return prevCamera; // Возвращаем прежнее состояние, чтобы избежать мерцания
    });
};

// Функция для зума к выделению
export const zoomToSelection = (setCamera: React.Dispatch<React.SetStateAction<Camera>>, selection: { x: number; y: number; width: number; height: number }, viewportWidth: number, viewportHeight: number) => {
    const zoom = Math.min(viewportWidth / selection.width, viewportHeight / selection.height);
    const x = -selection.x * zoom + (viewportWidth - selection.width * zoom) / 2;
    const y = -selection.y * zoom + (viewportHeight - selection.height * zoom) / 2;
    setCamera((prevCamera) => {
        animateZoom(prevCamera.zoom, zoom, setCamera);
        return { x, y, zoom };
    });
};