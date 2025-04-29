import React, { useState, useEffect } from "react";
import { Template, TemplateCategory } from "~/types";
import { useStorage, useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { Layer } from "~/types";

interface TemplatesListProps {
  selectedCategory: TemplateCategory;
}

const TemplatesList: React.FC<TemplatesListProps> = ({ selectedCategory }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Мутация для применения шаблона на холст
  const applyTemplate = useMutation(({ storage }, template: Template) => {
    // Получаем существующие слои
    const layers = storage.get("layers");
    const layerIds = storage.get("layerIds");
    
    // Добавляем слои из шаблона
    Object.entries(template.layers).forEach(([id, layer]) => {
      layers.set(id, new LiveObject(layer));
    });
    
    // Добавляем rootLayerIds шаблона в общий список слоев
    template.rootLayerIds.forEach(id => {
      layerIds.push(id);
    });
  }, []);

  // Загрузка шаблонов
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        // Здесь должен быть запрос к API для получения шаблонов
        const response = await fetch("/api/templates");
        const data = await response.json();
        
        // Фильтруем шаблоны по выбранной категории
        const filteredData = data.filter(
          (template: Template) => template.category === selectedCategory
        );
        setTemplates(filteredData);
      } catch (err) {
        setError("Не удалось загрузить шаблоны");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-paragraph-sm">
        <div className="animate-pulse text-text-sub-600">Загрузка шаблонов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-text-sub-600 text-paragraph-sm">
        {error}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-text-sub-600 text-paragraph-sm">
        Шаблоны в категории "{selectedCategory}" не найдены
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {templates.map((template) => (
        <div 
          key={template.id}
          className="hover:border-primary-500 flex cursor-pointer flex-col overflow-hidden rounded-lg border border-stroke-soft-200 transition-colors"
          onClick={() => applyTemplate(template)}
        >
          <div className="relative w-full h-32 bg-bg-weak_alt-100">
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesList; 