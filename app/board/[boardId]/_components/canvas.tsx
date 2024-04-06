"use client"

import { Info } from "./info"
import { Participants } from "./participants"
import { Toolbar } from "./toolbar"

import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useStorage,
  useOthersMapped,
  useSelf,
} from "@/liveblocks.config"
import { useMemo } from "react"
import { CanvasMode } from "@/types/canvas"
import { CursorsPresence } from "./cursors-presence"
import { connectionIdToColor, colorToCss } from "@/lib/utils"
import { LayerPreview } from "./layer-preview"
import { SelectionBox } from "./selection-box"
import { SelectionTools } from "./selection-tools"

import { Path } from "./path"
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce"
import { useKeyboardEventListener } from "@/hooks/use-keyboard-event-listener"
import { useCanvasEvent } from "@/hooks/use-canvas-event"
import { useCanvasStore } from "@/store/use-canvas-store"
interface CanvasProps {
  boardId: string
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const {
    onResizeHandlePointerDown,
    onWheel,
    onPointerMove,
    onPointerLeave,
    onPointerUp,
    onPointerDown,
    onLayerPointerDown,
  } = useCanvasEvent()

  const {
    camera,
    canvasState,
    setCanvasState,
    lastUsedColor,
    setLastUsedColor,
  } = useCanvasStore()

  useDisableScrollBounce()
  useKeyboardEventListener()

  const history = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const layerIds = useStorage((root) => root.layerIds)

  const pencilDraft = useSelf((me) => me.presence.pencilDraft)

  const selections = useOthersMapped((other) => other.presence.selection)

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {}

    for (const user of selections) {
      const [connectionId, selection] = user

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }

    return layerIdsToColorSelection
  }, [selections])

  return (
    <>
      <main className="h-full w-full relative bg-neutral-100 touch-none">
        <Info boardId={boardId} />

        <Participants />

        <Toolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          canRedo={canRedo}
          canUndo={canUndo}
          undo={history.undo}
          redo={history.redo}
        />

        <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />

        <svg
          onWheel={onWheel}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
          onPointerDown={onPointerDown}
          className="h-[100vh] w-[100vw]"
        >
          <g
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px)`,
            }}
          >
            {layerIds.map((layerId) => (
              <LayerPreview
                key={layerId}
                id={layerId}
                onLayerPointerDown={onLayerPointerDown}
                selectionColor={layerIdsToColorSelection[layerId]}
              />
            ))}

            <SelectionBox
              onResizeHandlePointerDown={onResizeHandlePointerDown}
            />

            {canvasState.mode === CanvasMode.SelectionNet &&
              canvasState.current != null && (
                <rect
                  className="fill-blue-500/5 stroke-blue-500 stroke-2"
                  x={Math.min(canvasState.origin.x, canvasState.current.x)}
                  y={Math.min(canvasState.origin.y, canvasState.current.y)}
                  width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                  height={Math.abs(
                    canvasState.origin.y - canvasState.current.y
                  )}
                />
              )}

            <CursorsPresence />

            {pencilDraft != null && pencilDraft.length > 0 && (
              <Path
                points={pencilDraft}
                fill={colorToCss(lastUsedColor)}
                x={0}
                y={0}
              />
            )}
          </g>
        </svg>
      </main>
    </>
  )
}
