import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RiCloseLine,
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiArrowRightLine,
  RiLockLine,
  RiCheckDoubleLine,
} from "@remixicon/react";
import type { TutorialCourse, TutorialLesson, TutorialTopic } from "~/types";
import * as Modal from "~/components/ui/modal";
import * as CommandMenu from "~/components/ui/command-menu";
import * as Divider from "~/components/ui/divider";
import * as TabMenuVertical from "~/components/ui/tab-menu-vertical";
import * as Button from "~/components/ui/button";

interface TutorialModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  course: TutorialCourse;
  initialTopicId?: string;
  initialLessonId?: string;
  onCompleteLesson?: (lessonId: string, completed: boolean) => void;
  onUpdateProgress?: (
    courseId: string,
    lessonId: string,
    completed: boolean,
  ) => void;
  variant?: "modal" | "command";
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenChange,
  course,
  initialTopicId,
  initialLessonId,
  onCompleteLesson,
  onUpdateProgress,
  variant = "modal", // По умолчанию используем стандартное модальное окно
}) => {
  // Создаем пустые заглушки для случаев, когда данных нет
  const emptyLesson = useMemo(() => ({
    id: "empty-lesson",
    title: "Занятия отсутствуют",
    content: "В данной теме пока нет материалов.",
    completed: false,
  }), []);

  const emptyTopic = useMemo(() => ({
    id: "empty-topic",
    title: "Темы отсутствуют",
    lessons: [emptyLesson],
  }), [emptyLesson]);

  // Получаем начальный топик
  const getInitialTopic = useCallback((): TutorialTopic => {
    // Если в курсе нет топиков, возвращаем заглушку
    if (!course.topics || course.topics.length === 0) {
      return emptyTopic;
    }

    // Если указан ID начального топика, ищем его
    if (initialTopicId) {
      for (const topic of course.topics) {
        if (topic.id === initialTopicId) {
          return topic;
        }
      }
    }

    // Иначе возвращаем первый топик
    return course.topics[0] ?? emptyTopic;
  }, [course.topics, initialTopicId, emptyTopic]);

  // Получаем начальный урок для указанного топика
  const getInitialLesson = useCallback((topic: TutorialTopic): TutorialLesson => {
    // Если в топике нет уроков, возвращаем заглушку
    if (!topic.lessons || topic.lessons.length === 0) {
      return emptyLesson;
    }

    // Если указан ID начального урока, ищем его
    if (initialLessonId) {
      for (const lesson of topic.lessons) {
        if (lesson.id === initialLessonId) {
          return lesson;
        }
      }
    }

    // Иначе возвращаем первый урок
    return topic.lessons[0] ?? emptyLesson;
  }, [initialLessonId, emptyLesson]);

  // Состояние для активного топика и урока
  const [activeTopic, setActiveTopic] =
    useState<TutorialTopic>(getInitialTopic);
  const [activeLesson, setActiveLesson] = useState<TutorialLesson>(() => {
    const topic = getInitialTopic();
    return getInitialLesson(topic);
  });

  // Инициализируем активную тему и урок при открытии курса
  useEffect(() => {
    if (isOpen && course) {
      setActiveTopic(getInitialTopic());
      setActiveLesson(getInitialLesson(getInitialTopic()));
    }
  }, [isOpen, course, initialTopicId, initialLessonId, getInitialTopic, getInitialLesson]);

  // Обработчик выбора урока
  const handleSelectLessonWithCompletedId = (topicId: string, lesson: TutorialLesson, justCompletedLessonId?: string) => {
    // Проверка, можно ли открыть этот урок (предыдущие должны быть выполнены)
    if (!canAccessLesson(topicId, lesson, justCompletedLessonId)) {
      return;
    }
    
    // Поиск топика по ID
    const foundTopic = course.topics?.find((t) => t.id === topicId);

    // Если топик найден, обновляем состояние
    if (foundTopic) {
      setActiveTopic(foundTopic);
      setActiveLesson(lesson);
    }
  };

  // Обработчик выбора урока - теперь вызывает новую функцию без передачи justCompletedLessonId
  const handleSelectLesson = (topicId: string, lesson: TutorialLesson) => {
    handleSelectLessonWithCompletedId(topicId, lesson);
  };

  // Функция для определения, может ли пользователь получить доступ к уроку
  const canAccessLesson = (
    topicId: string,
    lesson: TutorialLesson,
    justCompletedLessonId?: string,
  ): boolean => {
    // Если у нас нет функции отслеживания прогресса, разрешаем доступ ко всем урокам
    if (!onCompleteLesson && !onUpdateProgress) {
      return true;
    }

    const currentTopic = course.topics?.find((t) => t.id === topicId);
    if (!currentTopic) return false;

    // Индекс текущего урока в топике
    const lessonIndex = currentTopic.lessons.findIndex(
      (l) => l.id === lesson.id,
    );

    // Первый урок всегда доступен
    if (lessonIndex === 0) return true;

    // Проверяем, выполнен ли предыдущий урок
    const previousLesson = currentTopic.lessons[lessonIndex - 1];
    
    // Если предыдущий урок был только что отмечен как выполненный, учитываем это
    if (justCompletedLessonId && previousLesson?.id === justCompletedLessonId) {
      return true;
    }
    
    return Boolean(previousLesson?.completed);
  };

  // Функция для навигации к следующему уроку
  const goToNextLesson = () => {
    // Сохраняем текущий урок который нужно будет отметить как выполненным
    const lessonToMarkCompleted = activeLesson;
    const shouldMarkCompleted = !lessonToMarkCompleted.completed && (onCompleteLesson ?? onUpdateProgress);

    // Находим индекс текущего урока в активном топике
    const currentLessonIndex = activeTopic.lessons.findIndex(
      (l) => l.id === activeLesson.id,
    );
    
    // Определяем следующий урок
    let nextTopic = activeTopic;
    let nextLesson = null;
    
    // Если это последний урок в топике
    if (currentLessonIndex === activeTopic.lessons.length - 1) {
      // Находим индекс текущего топика
      const currentTopicIndex = course.topics.findIndex(
        (t) => t.id === activeTopic.id,
      );
      
      // Если есть следующий топик, переходим к его первому уроку
      if (currentTopicIndex < course.topics.length - 1) {
        const foundNextTopic = course.topics[currentTopicIndex + 1];
        if (foundNextTopic) {
          nextTopic = foundNextTopic;
          
          if (nextTopic.lessons?.length > 0) {
            nextLesson = nextTopic.lessons[0];
          }
        }
      }
    } else {
      // Иначе переходим к следующему уроку в текущем топике
      nextLesson = activeTopic.lessons[currentLessonIndex + 1];
    }
    
    // Если есть следующий урок, сохраняем его для последующей установки
    if (nextLesson) {
      // Сначала отмечаем текущий урок как выполненный
      if (shouldMarkCompleted) {
        handleCompleteLesson(lessonToMarkCompleted.id, true);
        
        // Сохраняем информацию о следующем уроке в замыкании
        const nextLessonCopy = nextLesson;
        const nextTopicCopy = nextTopic;
        
        // Устанавливаем короткую задержку перед переходом к следующему уроку
        // для того, чтобы состояние обновилось в родительском компоненте
        setTimeout(() => {
          // Обновляем состояние - устанавливаем следующий урок как активный
          setActiveTopic(nextTopicCopy);
          setActiveLesson(nextLessonCopy);
        }, 50); // Очень короткая задержка, которая не будет заметна пользователю
      } else {
        // Если урок уже отмечен выполненным, переходим к следующему без задержки
        // Обновляем состояние - устанавливаем следующий урок как активный
        setActiveTopic(nextTopic);
        setActiveLesson(nextLesson);
      }
    }
  };

  // Проверка наличия следующего урока
  const hasNextLesson = (): boolean => {
    const currentLessonIndex = activeTopic.lessons.findIndex(
      (l) => l.id === activeLesson.id,
    );

    // Если это последний урок в топике, проверяем наличие следующего топика
    if (currentLessonIndex === activeTopic.lessons.length - 1) {
      const currentTopicIndex = course.topics.findIndex(
        (t) => t.id === activeTopic.id,
      );
      return currentTopicIndex < course.topics.length - 1;
    }

    // Иначе в текущем топике есть следующий урок
    return currentLessonIndex < activeTopic.lessons.length - 1;
  };

  // Обработчик отметки урока как выполненного
  const handleCompleteLesson = (lessonId: string, completed: boolean) => {
    if (onCompleteLesson) {
      onCompleteLesson(lessonId, completed);
    }

    if (onUpdateProgress) {
      onUpdateProgress(course.id, lessonId, completed);
    }
  };

  // Обработчик закрытия модального окна
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else if (!open && onClose) {
      onClose();
    }
  };

  // Проверка, является ли текущий урок последним в курсе
  const isLastLessonInCourse = (): boolean => {
    const currentLessonIndex = activeTopic.lessons.findIndex(
      (l) => l.id === activeLesson.id,
    );
    
    const isLastInTopic = currentLessonIndex === activeTopic.lessons.length - 1;
    
    if (!isLastInTopic) return false;
    
    const currentTopicIndex = course.topics.findIndex(
      (t) => t.id === activeTopic.id,
    );
    
    return currentTopicIndex === course.topics.length - 1;
  };

  // Обработчик завершения курса
  const handleCompleteCourse = () => {
    // Отмечаем текущий урок как выполненный, если еще не отмечен
    if (!activeLesson.completed && (onCompleteLesson || onUpdateProgress)) {
      handleCompleteLesson(activeLesson.id, true);
    }
    
    // Закрываем модальное окно
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const contentComponent = (
    <div className="flex h-[680px]">
      {/* Сайдбар */}
      <div className="hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300 h-full w-60 flex-col gap-4 overflow-hidden border-r border-stroke-soft-200 p-4 pr-2 hover:overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        <TabMenuVertical.Root className="mb-4">
          <TabMenuVertical.List>
            {course.topics.map((topic) => (
              <React.Fragment key={topic.id}>
                <h4 className="mb-2 px-2 py-1 text-subheading-xs uppercase text-text-soft-400">
                  {topic.title}
                </h4>
                {topic.lessons.map((lesson) => {
                  const isAccessible = canAccessLesson(topic.id, lesson);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(topic.id, lesson)}
                      disabled={!isAccessible}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-paragraph-sm transition-colors ${
                        activeLesson.id === lesson.id
                          ? "bg-bg-weak-50 text-text-strong-950"
                          : isAccessible
                            ? "text-text-sub-600 hover:bg-bg-weak-50"
                            : "text-text-disabled-300 opacity-60"
                      }`}
                    >
                      <div
                        className={`flex size-5 flex-shrink-0 items-center justify-center rounded-full ${
                          lesson.completed
                            ? "text-success-base"
                            : !isAccessible
                              ? "text-text-disabled-300"
                              : "text-text-soft-400"
                        }`}
                      >
                        {lesson.completed ? (
                          <RiCheckboxCircleFill className="size-5" />
                        ) : !isAccessible ? (
                          <RiLockLine className="size-5" />
                        ) : (
                          <RiCheckboxBlankCircleLine className="size-5" />
                        )}
                      </div>
                      <span className="line-clamp-1 flex-1">
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </TabMenuVertical.List>
        </TabMenuVertical.Root>

        <Divider.Root className="" />

        <div className="mt-2 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-paragraph-xs text-text-sub-600">
              Прогресс
            </span>
            <span className="text-paragraph-xs text-text-sub-600">
              {Math.round(
                ((course.completedLessons ?? 0) / course.lessonsCount) * 100,
              )}
              %
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-soft-200">
            <div
              className="h-full rounded-full bg-primary-base"
              style={{
                width: `${Math.round(((course.completedLessons ?? 0) / course.lessonsCount) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Содержимое урока */}
      <div className="flex h-full flex-1 flex-col">
        <div className="w-full max-w-3xl p-6 h-full flex flex-col">
          <header className=" flex items-center justify-between">

            {variant === "modal" && (
              <Modal.Close className="flex size-10 items-center justify-center rounded-full hover:bg-bg-weak-50">
                <RiCloseLine className="size-6 text-text-soft-400" />
              </Modal.Close>
            )}
          </header>



          <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 mb-4">
            <div className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatContent(activeLesson.content),
                }}
              />
            </div>
          </div>

          {isLastLessonInCourse() ? (
            <div className="mt-auto flex justify-end">
              <Button.Root 
                variant="primary" 
                mode="filled"
                onClick={handleCompleteCourse}
                className="flex items-center gap-2"
              >
                Завершить
                <Button.Icon as={RiCheckDoubleLine} />
              </Button.Root>
            </div>
          ) : hasNextLesson() && (
            <div className="mt-auto flex justify-end">
              <Button.Root 
                variant="primary" 
                mode="lighter"
                onClick={goToNextLesson}
                className="flex items-center gap-2"
              >
                Далее
                <Button.Icon as={RiArrowRightLine} />
              </Button.Root>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Выбираем тип модального окна в зависимости от переданного варианта
  if (variant === "command") {
    return (
      <CommandMenu.Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        className="h-[680px] max-w-[980px] p-0"
      >
        <CommandMenu.DialogTitle className="sr-only">
          {course.title}
        </CommandMenu.DialogTitle>
        {contentComponent}
      </CommandMenu.Dialog>
    );
  }

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Content className="h-[680px] w-[900px] max-w-[90vw] overflow-hidden p-0">
        <Modal.Title className="sr-only">{course.title}</Modal.Title>
        {contentComponent}
      </Modal.Content>
    </Modal.Root>
  );
};

// Вспомогательная функция для форматирования markdown-контента
function formatContent(content: string): string {
  // Замена markdown на HTML
  let formatted = content
    .replace(/^# (.*)$/gm, "<h1 style='font-size: 1.25rem; font-weight: 600; letterSpacing: '0em'; margin-bottom: 0.75rem; margin-top: 1.25rem; color:#171717'>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2 style='font-size: 1.125rem; font-weight: 600; letterSpacing: '0em'; margin-bottom: 0.75rem; margin-top: 1.25rem; color:#171717'>$1</h2>")
    .replace(/^### (.*)$/gm, "<h3 style='font-size: 1rem; font-weight: 600; letterSpacing: '0em'; margin-bottom: 0.75rem; margin-top: 1.25rem; color:#171717'>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold'>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-lg max-w-full" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary-base hover:underline">$1</a>')
    .replace(/^- (.*?)$/gm, "<li class='mb-1'>$1</li>")
    .replace(/^(\d+)\. (.*?)$/gm, "<li class='mb-0'>$2</li>");

  // Замена списков
  formatted = formatted
    .replace(
      /<li>.*?<\/li>(\s*<li>.*?<\/li>)+/g,
      (match) => `<ul class='list-disc pl-6 my-4 space-y-1'>${match}</ul>`,
    )
    .replace(/\n\n/g, "<p class='mb-4'></p>");

  // Дополнительные стили для блоков кода и цитат
  formatted = formatted
    .replace(/```(.*?)```/gs, "<pre class='bg-bg-weak-50 p-4 rounded-lg my-4 overflow-x-auto text-sm'><code>$1</code></pre>")
    .replace(/^> (.*?)$/gm, "<blockquote class='border-l-4 border-primary-100 pl-4 py-1 my-4 text-text-sub-600 italic'>$1</blockquote>");

  return formatted;
}
