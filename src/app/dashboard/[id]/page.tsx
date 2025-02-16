/*** Страница редактора ***/

import Canvas from "~/components/canvas/Canvas";
import { Room } from "~/components/liveblocks/Room";
import { auth } from "~/server/auth";
import { CanvasProvider } from "~/components/canvas/helper/CanvasContext";

type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;
  const session = await auth();

  return (

      <Room roomId={"room:" + id}>
          <CanvasProvider>
              <Canvas />
          </CanvasProvider>
      </Room>

  );
}