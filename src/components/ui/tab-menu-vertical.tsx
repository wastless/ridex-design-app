'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '~/utils/cn';
import type { IconComponent } from '~/types/icon';

type TabMenuVerticalContextType = {
  isActive: boolean;
};

const TabMenuVerticalContext = React.createContext<TabMenuVerticalContextType | null>(null);

const useTabMenuVertical = () => {
  const context = React.useContext(TabMenuVerticalContext);
  if (!context) {
    throw new Error('TabMenuVertical components must be used within TabMenuVerticalRoot');
  }
  return context;
};

type TabMenuVerticalRootProps = {
  children: React.ReactNode;
  className?: string;
};

const TabMenuVerticalRoot = React.forwardRef<
  HTMLDivElement,
  TabMenuVerticalRootProps
>(({ className, children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      {...rest}
    >
      {children}
    </div>
  );
});
TabMenuVerticalRoot.displayName = 'TabMenuVerticalRoot';

const TabMenuVerticalList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full space-y-1', className)}
      {...rest}
    />
  );
});
TabMenuVerticalList.displayName = 'TabMenuVerticalList';

type TabMenuVerticalTriggerProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const TabMenuVerticalTrigger = React.forwardRef<
  HTMLAnchorElement,
  TabMenuVerticalTriggerProps
>(({ href, className, children, ...rest }, ref) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <TabMenuVerticalContext.Provider value={{ isActive }}>
      <Link
        ref={ref}
        href={href}
        className={cn(
          // base
          'group/tab-item relative w-full rounded-lg p-2.5 text-left text-label-sm outline-none',
          'grid auto-cols-auto grid-flow-col grid-cols-[auto,minmax(0,1fr)] items-center gap-2',
          'transition duration-200 ease-out',
          // hover
          'hover:bg-bg-weak-50',
          // focus
          'focus:outline-none',
          // states
          isActive ? 'text-primary-base' : 'text-text-sub-600',
          // active indicator
          isActive && 'bg-bg-weak-50 before:absolute before:top-1/2 before:h-5 before:w-1 before:origin-left before:-translate-y-1/2 before:rounded-r-full before:bg-primary-base before:transition before:duration-200 before:ease-out before:-left-5 before:scale-100',
          className,
        )}
        {...rest}
      >
        {children}
      </Link>
    </TabMenuVerticalContext.Provider>
  );
});
TabMenuVerticalTrigger.displayName = 'TabMenuVerticalTrigger';

function TabMenuVerticalIcon({
  className,
  as: Component,
  ...rest
}: {
  className?: string;
  as: IconComponent;
} & Omit<React.SVGProps<SVGSVGElement>, 'as'>) {
  const { isActive } = useTabMenuVertical();

  return (
    <Component
      className={cn(
        'size-6',
        'transition duration-200 ease-out',
        isActive ? 'text-primary-base' : 'text-text-sub-600',
        className,
      )}
      {...rest}
    />
  );
}
TabMenuVerticalIcon.displayName = 'TabsVerticalIcon';

export {
  TabMenuVerticalRoot as Root,
  TabMenuVerticalList as List,
  TabMenuVerticalTrigger as Trigger,
  TabMenuVerticalIcon as Icon,
};
