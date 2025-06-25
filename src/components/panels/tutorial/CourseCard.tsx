/**
 * Карточка учебного курса отвечает за отображение информации о курсе, визуализацию статуса прохождения и обработку клика для открытия содержимого курса.
 * Компонент используется в списке курсов для наглядного представления прогресса пользователя.
 */

import React from "react";
import type { TutorialCourse } from "~/types";
import Image from "next/image";

interface CourseCardProps {
  course: TutorialCourse;
  onClick: (course: TutorialCourse) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  // Рассчитываем процент прохождения курса
  const progressPercent = course.completedLessons
    ? Math.round((course.completedLessons / course.lessonsCount) * 100)
    : 0;

  // Определяем статус курса
  const getCourseStatus = () => {
    if (progressPercent === 100) return "completed";
    if (progressPercent > 0) return "pending";
    if (course.isNew) return "pending";
    return "disabled";
  };

  // Определяем текст статуса
  const getStatusText = () => {
    if (progressPercent === 100) return "Пройден";
    if (progressPercent > 0) return "В процессе";
    if (course.isNew) return "Новый";
    return "Не начат";
  };

  return (
    <div
      className="flex cursor-pointer flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50"
      onClick={() => onClick(course)}
    >
        
      {/* Верхняя часть карточки с иконкой и информацией */}
      <div className="mb-3 flex items-center gap-3">
        {/* Иконка курса */}
        <div className="flex-shrink-0">
          <Image
            src={course.iconPath}
            alt={course.title}
            width={32}
            height={32}
            className="rounded"
          />
        </div>

        <div className="flex-2">
          {/* Название курса */}
          <h3 className="text-label-sm text-text-strong-950">
            {course.title}
          </h3>

          {/* Информация о продолжительности, уровне и статусе */}
          <div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
            <div className="flex items-center gap-1">
              <span>{course.duration}  •  {course.level}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-label-xs ${
              getCourseStatus() === 'completed' ? 'bg-green-100 text-green-800' :
              getCourseStatus() === 'pending' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Описание курса */}
      <p className="line-clamp-2 text-paragraph-xs text-text-sub-600">
        {course.description}
      </p>
    </div>
  );
};
