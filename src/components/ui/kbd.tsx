// Kbd

import * as React from "react";

import { cnExt } from "~/utils/cn";

function Kbd({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cnExt(
        "flex h-5 items-center gap-0.5 whitespace-nowrap rounded px-1.5 text-subheading-xs text-text-soft-400",
        className,
      )}
      {...rest}
    />
  );
}

export { Kbd as Root };
