/**
 * Список шаблонов отвечает за отображение и загрузку шаблонов выбранной категории, а также за применение выбранного шаблона на холст проекта.
 * Компонент обеспечивает взаимодействие с сервером и интеграцию шаблонов в рабочее пространство пользователя.
 */

import React, { useState, useEffect } from "react";
import type { Template, TemplateCategory } from "~/types";
import { useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import Image from "next/image";

interface TemplatesListProps {
  selectedCategory: TemplateCategory;
}

const TemplatesList: React.FC<TemplatesListProps> = ({ selectedCategory }) => {
  // Состояния для хранения данных о шаблонах, загрузке и ошибках
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

  // Загрузка шаблонов выбранной категории с сервера
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        // Здесь должен быть запрос к API для получения шаблонов
        const response = await fetch("/api/templates");
        const data = (await response.json()) as Template[];
        
        // Фильтруем шаблоны по выбранной категории
        const filteredData = data.filter(
          (template) => template.category === selectedCategory
        );
        setTemplates(filteredData);
      } catch (err) {
        setError("Не удалось загрузить шаблоны");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTemplates();
  }, [selectedCategory]);

  // Отображаем индикатор загрузки
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-paragraph-sm">
        <div className="animate-pulse text-text-sub-600">Загрузка шаблонов...</div>
      </div>
    );
  }

  // Отображаем сообщение об ошибке
  if (error) {
    return (
      <div className="text-text-sub-600 text-paragraph-sm">
        {error}
      </div>
    );
  }

  // Отображаем сообщение, если шаблоны не найдены
  if (templates.length === 0) {
    return (
      <div className="text-text-sub-600 text-paragraph-sm">
        Шаблоны в категории &quot;{selectedCategory}&quot; не найдены
      </div>
    );
  }

  // Отображаем список шаблонов
  return (
    <div className="space-y-6 pb-16">
      {templates.map((template) => (
        <div 
          key={template.id}
          className="hover:border-primary-500 flex cursor-pointer flex-col overflow-hidden rounded-lg border border-stroke-soft-200 transition-colors"
          onClick={() => applyTemplate(template)}
        >
          <div className="relative w-full h-32 bg-bg-weak_alt-100">
            <Image 
              src={template.thumbnail} 
              alt={template.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesList; 