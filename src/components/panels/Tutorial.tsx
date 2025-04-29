import React, { useState, useEffect } from 'react';
import { tutorialCourses } from './tutorial/courses';
import { TutorialCourse } from '~/types';
import { CourseCard } from './tutorial/CourseCard';
import { TutorialModal } from './tutorial/TutorialModal';
import { RiDeleteBin7Line } from '@remixicon/react';

// Ключ для хранения данных в localStorage
const TUTORIAL_PROGRESS_KEY = 'tutorial_progress';

export const Tutorial: React.FC = () => {
  const [courses, setCourses] = useState<TutorialCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TutorialCourse | null>(null);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  // Загружаем курсы при первом рендере, восстанавливая прогресс из localStorage
  useEffect(() => {
    loadCoursesWithProgress();
  }, []);
  
  // Функция загрузки курсов с прогрессом
  const loadCoursesWithProgress = () => {
    const savedProgressString = localStorage.getItem(TUTORIAL_PROGRESS_KEY);
    
    if (savedProgressString) {
      try {
        // Парсим сохраненный прогресс
        const savedProgress = JSON.parse(savedProgressString);
        
        // Применяем сохраненный прогресс к курсам
        const coursesWithProgress = tutorialCourses.map(course => {
          const courseProgress = savedProgress[course.id];
          
          if (courseProgress) {
            // Обновляем статусы уроков на основе сохраненных данных
            const updatedTopics = course.topics.map(topic => {
              const updatedLessons = topic.lessons.map(lesson => {
                const isCompleted = courseProgress.completedLessons.includes(lesson.id);
                return { ...lesson, completed: isCompleted };
              });
              return { ...topic, lessons: updatedLessons };
            });
            
            // Рассчитываем общее количество выполненных уроков
            let completedCount = 0;
            updatedTopics.forEach(topic => {
              topic.lessons.forEach(lesson => {
                if (lesson.completed) completedCount++;
              });
            });
            
            return {
              ...course,
              topics: updatedTopics,
              completedLessons: completedCount
            };
          }
          
          return course;
        });
        
        setCourses(coursesWithProgress);
      } catch (e) {
        console.error('Ошибка восстановления прогресса:', e);
        setCourses(tutorialCourses);
      }
    } else {
      // Если сохраненного прогресса нет, используем исходные курсы
      setCourses(tutorialCourses);
    }
  };

  const handleCourseClick = (course: TutorialCourse) => {
    setSelectedCourse(course);
    setIsCourseOpen(true);
  };

  // Обновляем прогресс по уроку и сохраняем в localStorage
  const handleUpdateProgress = (courseId: string, lessonId: string, completed: boolean) => {
    setCourses(prevCourses => {
      const updatedCourses = prevCourses.map(course => {
        if (course.id === courseId) {
          // Найдем урок и обновим его статус
          const updatedTopics = course.topics.map(topic => {
            const updatedLessons = topic.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return { ...lesson, completed };
              }
              return lesson;
            });
            return { ...topic, lessons: updatedLessons };
          });
          
          // Посчитаем общее количество выполненных уроков
          let completedCount = 0;
          updatedTopics.forEach(topic => {
            topic.lessons.forEach(lesson => {
              if (lesson.completed) completedCount++;
            });
          });
          
          return { 
            ...course, 
            topics: updatedTopics, 
            completedLessons: completedCount 
          };
        }
        return course;
      });
      
      // Сохраняем обновленный прогресс в localStorage
      saveProgressToLocalStorage(updatedCourses);
      
      return updatedCourses;
    });
    
    // Также обновим выбранный курс
    if (selectedCourse && selectedCourse.id === courseId) {
      const updatedTopics = selectedCourse.topics.map(topic => {
        const updatedLessons = topic.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, completed };
          }
          return lesson;
        });
        return { ...topic, lessons: updatedLessons };
      });
      
      let completedCount = 0;
      updatedTopics.forEach(topic => {
        topic.lessons.forEach(lesson => {
          if (lesson.completed) completedCount++;
        });
      });
      
      setSelectedCourse({
        ...selectedCourse,
        topics: updatedTopics,
        completedLessons: completedCount
      });
    }
  };
  
  // Функция для сохранения прогресса в localStorage
  const saveProgressToLocalStorage = (updatedCourses: TutorialCourse[]) => {
    try {
      // Создаем объект с прогрессом по каждому курсу
      const progressData: Record<string, { completedLessons: string[] }> = {};
      
      updatedCourses.forEach(course => {
        const completedLessons: string[] = [];
        
        // Собираем ID всех выполненных уроков
        course.topics.forEach(topic => {
          topic.lessons.forEach(lesson => {
            if (lesson.completed) {
              completedLessons.push(lesson.id);
            }
          });
        });
        
        progressData[course.id] = { completedLessons };
      });
      
      // Сохраняем прогресс в localStorage
      localStorage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify(progressData));
    } catch (e) {
      console.error('Ошибка сохранения прогресса:', e);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={handleCourseClick} 
          />
        ))}
      </div>
      
      {selectedCourse && (
        <TutorialModal
          course={selectedCourse}
          isOpen={isCourseOpen}
          onOpenChange={setIsCourseOpen}
          onUpdateProgress={handleUpdateProgress}
          variant="command"
        />
      )}
    </>
  );
}; 