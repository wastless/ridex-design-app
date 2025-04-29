// UserProfileCard

"use client";

import * as React from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Avatar from "~/components/ui/avatar";
import { IconEmptyUser } from "~/components/ui/avatar-empty-icons";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiLogoutBoxRLine,
  RiSettings2Line,
} from "@remixicon/react";
import { cn } from "~/utils/cn";
import * as Divider from "~/components/ui/divider";
import { tv } from "~/utils/tv";
import { signout } from "~/app/actions/auth";
import { useSession } from "next-auth/react";

const userProfileCardVariants = tv({
  slots: {
    root: [
      "flex w-full items-center gap-3 whitespace-nowrap rounded-10 p-3 text-left outline-none",
      "hover:bg-bg-weak-50 focus:outline-none transition-all duration-200 ease-out",
    ],
    name: "text-label-sm",
    email: "text-paragraph-xs text-text-sub-600",
    triggerArrow: [
      // base
      "ml-auto shrink-0",
      // filled state
      "text-text-sub-600",
      // animation
      "[&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:ease-out",
    ],
  },
});

type UserProfileCardProps = {
  email: string;
  name?: string | null;
  image?: string | null;
};

export function UserProfileCard({ email, name, image }: UserProfileCardProps) {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();

  const {
    root,
    name: nameClass,
    email: emailClass,
    triggerArrow,
  } = userProfileCardVariants();

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <button className={root()}>
          <Avatar.Root size="40">
            {image ? (
              <Avatar.Image src={image} alt={name ?? email} />
            ) : (
              <Avatar.Image asChild>
                <IconEmptyUser />
              </Avatar.Image>
            )}
          </Avatar.Root>

          <div className="flex w-[172px] shrink-0 items-center gap-3 transition duration-300">
            <div className="flex-1 space-y-1">
              <div className={nameClass()}>
                {session?.user?.name ?? name ?? email}
              </div>
              <div className={emailClass()}>{email}</div>
            </div>

            <div
              className={cn(
                triggerArrow(),
                "flex size-6 items-center justify-center rounded-md",
              )}
            >
              <RiArrowDownSLine
                className={cn("size-5", open && "rotate-180")}
              />
            </div>
          </div>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content
        align="start"
        className="w-[248px]"
        style={{
          transform: `translate(0px, -8px)`,
        }}
      >
        <Dropdown.Group>
          <Dropdown.Item>
            <Dropdown.ItemIcon as={RiSettings2Line} />
            Настройки
          </Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Group>
          <Dropdown.Item>
            <Dropdown.ItemIcon as={RiAddLine} />
            Добавить аккаунт
          </Dropdown.Item>
          <Divider.Root variant="line-spacing" />
          <Dropdown.Item onClick={signout}>
            <Dropdown.ItemIcon as={RiLogoutBoxRLine} />
            Выйти
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
