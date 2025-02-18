import { Camera } from "~/types";

const MAX_ZOOM = 3; // Максимальный зум
const MIN_ZOOM = 0.2; // Минимальный зум

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