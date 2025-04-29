import React, { useState, useEffect } from "react";
import { TemplateCategory } from "~/types";
import TemplatesList from "./TemplatesList";
import { RiArrowLeftLine } from "@remixicon/react";
import * as CompactButton from "~/components/ui/compact-button";
import Image from "next/image";

interface Template {
  category: TemplateCategory;
  // Add other template properties as needed
}

// Маппинг категорий на иконки/миниатюры
const categoryIcons: Record<TemplateCategory, string> = {
  [TemplateCategory.Presentation]: "/templates/categories/thumbnail_presentation_16_9.svg",
  [TemplateCategory.SocialMedia]: "/templates/categories/thumbnail_vk_post.svg",
  [TemplateCategory.BusinessCard]: "/templates/categories/thumbnail_business_card.svg",
  [TemplateCategory.Poster]: "/templates/categories/thumbnail_poster.svg",
  [TemplateCategory.Logo]: "/templates/categories/thumbnail_logo.svg",
  [TemplateCategory.Document]: "/templates/categories/thumbnail_doc.svg",
};

// Функция для склонения слова "шаблон"
const getTemplateWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "шаблонов";
  }

  if (lastDigit === 1) {
    return "шаблон";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "шаблона";
  }

  return "шаблонов";
};

const TemplatesTab: React.FC = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateCounts, setTemplateCounts] = useState<Record<TemplateCategory, number>>({} as Record<TemplateCategory, number>);

  // Загружаем список доступных категорий и количество шаблонов
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setCategories(Object.values(TemplateCategory));
        
        const response = await fetch("/api/templates");
        const templates = await response.json() as Template[];
        
        const counts = Object.values(TemplateCategory).reduce((acc, category) => {
          acc[category] = templates.filter((t) => t.category === category).length;
          return acc;
        }, {} as Record<TemplateCategory, number>);
        
        setTemplateCounts(counts);
      } catch (err) {
        console.error("Ошибка при загрузке категорий:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  // Обработчик выбора категории
  const handleCategorySelect = (category: TemplateCategory) => {
    setSelectedCategory(category);
  };

  // Обработчик возврата к списку категорий
  const handleBack = () => {
    setSelectedCategory(null);
  };

  // Если выбрана категория - показываем шаблоны этой категории
  if (selectedCategory) {
    return (
      <div className="flex h-full flex-col">

          <div className="flex flex-row items-center gap-2 px-4 py-3 shrink-0">
            <CompactButton.Root
              size="medium"
              variant="ghost"
              onClick={handleBack}
            >
              <CompactButton.Icon as={RiArrowLeftLine} />
            </CompactButton.Root>
            <span className="text-paragraph-sm text-text-sub-600">
            {selectedCategory}
            </span>
          </div>

          <div className="px-4 py-2 hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300 flex-1 overflow-hidden hover:overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
            <TemplatesList selectedCategory={selectedCategory} />
          </div>

      </div>
    );
  }

  // Если категория не выбрана - показываем список категорий
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 py-2">
        <span className="text-label-sm text-text-strong-950">Категории</span>
      </div>

      {isLoading ? (
        <div className="px-4 py-2 text-paragraph-sm text-text-sub-600">
          Загрузка категорий...
        </div>
      ) : (
        <div className="hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300 flex-1 overflow-y-auto px-4 py-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          <div className="space-y-5 pb-16">
            {categories.map((category) => (
              <div key={category} className="flex flex-col gap-2">
                <div
                  className="hover:border-primary-500 flex cursor-pointer flex-col overflow-hidden rounded-lg border border-stroke-soft-200 transition-colors"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="bg-bg-weak_alt-100 relative h-32 w-full">
                    <Image
                      src={categoryIcons[category]}
                      alt={category}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="text-paragraph-sm text-text-strong-950">
                    {category}
                  </div>
                  <div className="text-paragraph-xs text-text-sub-600">
                    {templateCounts[category] || 0} {getTemplateWord(templateCounts[category] || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;
