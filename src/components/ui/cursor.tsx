import { memo } from "react";
import { useOther } from "@liveblocks/react/suspense";
import { connectionIdToColor } from "../../utils";
import { useCanvas } from "../canvas/helper/CanvasContext";

function Cursor({ connectionId }: { connectionId: number }) {
  const cursor = useOther(connectionId, (user) => user.presence.cursor);
  const { camera } = useCanvas();
  
  if (!cursor) {
    return null;
  }

  const { x, y } = cursor;
  return (
    <path
      style={{
        transform: `translateX(${x}px) translateY(${y}px) scale(${1 / camera.zoom})`,
        transformOrigin: "0 0"
      }}
      d="M2.59583 13.374L0.0958252 0.374023L11.0958 6.87402L5.59583 8.37402L2.59583 13.374Z"
      fill={connectionIdToColor(connectionId)}
    />
  );
}

export default memo(Cursor);