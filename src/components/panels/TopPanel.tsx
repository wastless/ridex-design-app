import React from "react";
import Link from "next/link";
import { useSelf, useOthers } from "@liveblocks/react";
import { RiArrowDownSLine } from "@remixicon/react";
import { connectionIdToColor } from "~/utils";
import UserAvatar from "./UserAvatar";
import ShareMenu from "./ShareMenu";
import { User } from "@prisma/client";
import {
  Root as AvatarGroup,
  Overflow as AvatarGroupOverflow,
} from "~/components/ui/avatar-group";

interface TopPanelProps {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  owner: User;
}

export const TopPanel: React.FC<TopPanelProps> = ({
  roomName,
  roomId,
  othersWithAccessToRoom,
  owner,
}) => {
  const me = useSelf();
  const others = useOthers();
  const isOwner = me?.info.name === owner.email;

  return (
    <div className="fixed relative left-0 top-0 flex h-[48px] w-full select-none items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-2">
      <div className="flex flex-row items-center gap-2">
        <img
          src="/icon/ridex-logo.svg"
          alt="RideX"
          className="h-[32px] w-[32px]"
        />
        <div className="flex items-center gap-2 text-paragraph-sm">
          <Link
            href="/dashboard"
            className="text-text-sub-600 hover:text-text-strong-950"
          >
            Черновик
          </Link>
          <span className="text-text-sub-600">/</span>

          <button className="flex items-center gap-1">
            <span className="text-text-strong-950">{roomName}</span>
            <RiArrowDownSLine className="h-4 w-4 text-text-strong-950 transition-transform duration-200 ease-out hover:translate-y-[2px]" />
          </button>
        </div>
      </div>

      <div className="flex flex-row items-center gap-3">
        <AvatarGroup size="32">
          {me && (
            <UserAvatar
              color={connectionIdToColor(me.connectionId)}
              name={me.info.name}
              image={me.info.image}
            />
          )}
          {others.length > 2 ? (
            <>
              {others.slice(0, 2).map((other) => (
                <UserAvatar
                  key={other.connectionId}
                  color={connectionIdToColor(other.connectionId)}
                  name={other.info.name}
                  image={other.info.image}
                />
              ))}
              <AvatarGroupOverflow>
                +{others.length - 2}
              </AvatarGroupOverflow>
            </>
          ) : (
            others.map((other) => (
              <UserAvatar
                key={other.connectionId}
                color={connectionIdToColor(other.connectionId)}
                name={other.info.name}
                image={other.info.image}
              />
            ))
          )}
        </AvatarGroup>
        <ShareMenu
          roomId={roomId}
          othersWithAccessToRoom={othersWithAccessToRoom}
          owner={owner}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default TopPanel; 