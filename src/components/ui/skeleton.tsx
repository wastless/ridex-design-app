import { cn } from "~/utils";
import { useEffect, useState } from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-bg-weak-50",
        "before:absolute before:inset-0",
        "before:rotate-12 before:scale-150",
        "before:bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)]",
        "before:animate-shimmer before:bg-[length:200%_100%]",

        className,
      )}
    />
  );
}

export function PageSkeleton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Top Panel */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-64 border-r p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50">
          <div className="flex h-full items-center justify-center">
            {/* Canvas content will be here */}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fixed bottom-4 left-1/2 z-[50] flex -translate-x-1/2 items-center justify-center rounded-lg bg-bg-white-0 p-2">
        <div className="flex items-center justify-center gap-2">
          {/* Selection Tool */}
          <Skeleton className="h-10 w-10 rounded-lg" />

          {/* Frame Tool */}
          <Skeleton className="h-10 w-10 rounded-lg" />

          {/* Shape Tools */}
          <Skeleton className="h-10 w-10 rounded-lg" />

          {/* Pencil Tool */}
          <Skeleton className="h-10 w-10 rounded-lg" />

          {/* Text Tool */}
          <Skeleton className="h-10 w-10 rounded-lg" />

          {/* Palette Tool */}
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
