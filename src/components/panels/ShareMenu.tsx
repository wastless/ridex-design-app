import { User } from "@prisma/client";
import {
  RiCloseLine,
  RiInformationFill,
} from "@remixicon/react";
import { useState } from "react";
import * as React from "react";
import { shareRoom, deleteInvitation } from "~/app/actions/rooms";
import * as Divider from "~/components/ui/divider";
import * as Button from "~/components/ui/button";
import * as Input from "~/components/ui/input";
import * as Modal from "~/components/ui/modal";
import * as CompactButton from "~/components/ui/compact-button";
import * as Hint from "~/components/ui/hint";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { link } from "~/icon";
import UserAvatar from "./UserAvatar";
import { useSelf } from "@liveblocks/react";
import ModeButton from "~/components/ui/mode-button";

export default function ShareMenu({
  roomId,
  othersWithAccessToRoom,
  owner,
  isOwner,
}: {
  roomId: string;
  othersWithAccessToRoom: User[];
  owner: User;
  isOwner: boolean;
}) {
  const me = useSelf();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"share" | "download">("share");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setEmail("");
      setError(undefined);
    }
  };

  const inviteUser = async () => {
    if (!isOwner) {
      setError("У вас нет прав для приглашения пользователей в эту комнату.");
      return;
    }

    // Проверяем, не приглашен ли уже пользователь
    if (othersWithAccessToRoom.some((user) => user.email === email)) {
      setError("Этот пользователь уже имеет доступ к комнате");
      return;
    }

    // Проверяем, не пытается ли владелец пригласить самого себя
    if (me && me.info.name === email) {
      setError("Вы не можете пригласить самого себя");
      return;
    }

    const error = await shareRoom(roomId, email);
    setError(error);
    if (!error) {
      setEmail("");
    }
  };

  const handleDeleteInvitation = async (userEmail: string) => {
    if (!isOwner) {
      setError("У вас нет прав для удаления пользователей из этой комнаты.");
      return;
    }

    const error = await deleteInvitation(roomId, userEmail);
    if (error) {
      setError(error);
    }
  };

  return (
    <div>
      <Modal.Root open={open} onOpenChange={handleOpenChange}>
        <Modal.Trigger asChild>
          <Button.Root
            variant="primary"
            mode="lighter"
            size="xsmall"
            onClick={() => setOpen(true)}
          >
            Поделиться
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content className="max-w-[560px]">
          <VisuallyHidden>
            <Modal.Title>Поделиться комнатой</Modal.Title>
          </VisuallyHidden>
          <Modal.Header className="flex flex-row justify-between">
            <div className="flex flex-row gap-1">
              <ModeButton
                onSelect={() => setActiveTab("share")}
                active={activeTab === "share"}
                text="Поделиться"
                variant="primary"
              />
              <ModeButton
                onSelect={() => setActiveTab("download")}
                active={activeTab === "download"}
                text="Скачать"
                variant="primary"
              />
            </div>
            <Button.Root variant="primary" mode="ghost" size="xxsmall">
              <Button.Icon as={link} />
              Копировать ссылку
            </Button.Root>
          </Modal.Header>

          {activeTab === "share" && (
            <>
              <Modal.Body className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col w-full gap-1">
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError(undefined); // Сбрасываем ошибку при изменении email
                          }}
                          placeholder="Добавьте участников по электронной почте"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                    {error && (
                      <Hint.Root hasError>
                        <Hint.Icon as={RiInformationFill} /> {error}
                      </Hint.Root>
                    )}
                  </div>
                  <Button.Root 
                    variant="primary" 
                    mode="lighter"
                    disabled={!validateEmail(email)}
                    onClick={inviteUser}
                  >
                    Пригласить
                  </Button.Root>
                </div>
              </Modal.Body>
              <Divider.Root variant="solid-text">
                пользователи с доступом
              </Divider.Root>
              <Modal.Footer className="flex flex-col gap-2">
                {/* Owner */}
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={owner.email} image={owner.image} />
                    <span className="text-paragraph-sm">{owner.email}</span>
                  </div>
                  <div>
                    <span className="text-paragraph-sm text-text-soft-400">
                      владелец
                    </span>
                  </div>
                </div>

                {/* Current user if not owner */}
                {me && !isOwner && (
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={me.info.name} image={me.info.image} />
                      <span className="text-paragraph-sm">{me.info.name}</span>
                    </div>
                    <div>
                      <span className="text-paragraph-sm text-text-soft-400">
                        может редактировать
                      </span>
                    </div>
                  </div>
                )}

                {/* Other users with access */}
                {othersWithAccessToRoom
                  .filter(user => user.id !== owner.id && (!me || user.id !== me.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex w-full flex-row items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.email} image={user.image} />
                        <span className="text-paragraph-sm">{user.email}</span>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <span className="text-paragraph-sm text-text-soft-400">
                          может редактировать
                        </span>
                        {isOwner && (
                          <CompactButton.Root
                            variant="ghost"
                            size="medium"
                            className="text-text-soft-400"
                            onClick={() => handleDeleteInvitation(user.email)}
                          >
                            <CompactButton.Icon as={RiCloseLine} />
                          </CompactButton.Root>
                        )}
                      </div>
                    </div>
                  ))}
              </Modal.Footer>
            </>
          )}

          {activeTab === "download" && (
            <Modal.Body className="flex flex-col gap-2">
              <div className="text-text-sub-600">
                Функция скачивания будет доступна в ближайшее время
              </div>
            </Modal.Body>
          )}
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
