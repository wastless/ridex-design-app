"use client";

/**
 * Компонент отображения всех проектов пользователя
 * Показывает карточки всех доступных проектов с возможностью сортировки и выбора
 */

import { useState, useRef, useMemo, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import * as Button from "~/components/ui/button";
import * as Dropdown from "~/components/ui/dropdown";
import { useRouter } from "next/navigation";
import DesignCard from "./DesignCard";
import { quill_pen_line } from "~/icon";
import { useUser } from "~/hooks/use-user";

export default function Drafts() {
  // Получаем данные из контекста пользователя
  const user = useUser();
  
  const ownedRooms = useMemo(() => user.ownedRooms || [], [user.ownedRooms]);

  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"createdAt" | "title">("createdAt");
  const outerDivRef = useRef<HTMLDivElement>(null);

  // Сортируем комнаты по выбранному критерию
  const allRooms = useMemo(() => {
    return ownedRooms.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ownedRooms, sortBy]);

  // Обработчик кликов вне области для снятия выбора с комнаты
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        outerDivRef.current &&
        !outerDivRef.current.contains(e.target as Node)
      ) {
        setSelected(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={outerDivRef}>
      <div className="space-y-6 px-8 py-5">
        <div className="flex items-center justify-between">
          <span className="text-title-h6 text-text-strong-950">
            Все дизайны
          </span>

          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button.Root variant="neutral" size="xxsmall" mode="stroke">
                {sortBy === "createdAt" && "Недавние"}
                {sortBy === "title" && "По алфавиту"}
                <Button.Icon as={RiArrowDownSLine} />
              </Button.Root>
            </Dropdown.Trigger>
            <Dropdown.Content
              align="end"
              className="w-32"
              style={{ transform: `translate(0px, -8px)` }}
            >
              <Dropdown.Item onSelect={() => setSortBy("createdAt")}>
                Недавние
              </Dropdown.Item>
              <Dropdown.Item onSelect={() => setSortBy("title")}>
                По алфавиту
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {allRooms.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="border-gainsboro flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full p-4 [background:linear-gradient(180deg,_rgba(228,_229,_231,_0.48),_rgba(247,_248,_248,_0),_rgba(228,_229,_231,_0))]">
                <div className="flex items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-regular-sm">
                  {quill_pen_line({ className: "text-text-soft-400" })}
                </div>
              </div>
              <p className="text-paragraph-medium mt-1 text-text-soft-400">
                Здесь ничего нет
              </p>
            </div>
          ) : (
            allRooms.map((room) => (
              <DesignCard
                key={room.id}
                room={room}
                selected={selected === room.id}
                onSelect={() => setSelected(room.id)}
                onNavigate={() => router.push("/dashboard/" + room.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
