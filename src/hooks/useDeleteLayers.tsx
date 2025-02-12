/*** Хук для удаления всех выделенных слоев ***/

import { useMutation, useSelf } from "@liveblocks/react";

export default function useDeleteLayers() {
    const selection = useSelf((me) => me.presence.selection); // Получаем список выбранных слоев

    return useMutation(
        ({ storage, setMyPresence }) => {

            const liveLayers = storage.get("layers") // Получаем слои
            const liveLayerIds = storage.get("layerIds"); // Получаем id слоев

            // Удаляем все выбранные слои
            for (const id of selection ?? []) {
                liveLayers.delete(id);

                const index = liveLayerIds.indexOf(id);
                if (index !== -1) {
                    liveLayerIds.delete(index); // Удаляем id слоя
                }
            }
            // Обновляем состояние и записываем в историю
            setMyPresence({ selection: [] }, { addToHistory: true });
        },
        [selection],
    );
}
