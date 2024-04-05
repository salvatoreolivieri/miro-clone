"use client"

import { nanoid } from "nanoid"
import { Info } from "./info"
import { Participants } from "./participants"
import { Toolbar } from "./toolbar"

import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStorage,
} from "@/liveblocks.config"
import { useCallback, useState } from "react"
import {
  CanvasMode,
  CanvasState,
  Camera,
  Color,
  LayerType,
  Point,
} from "@/types/canvas"
import { CursorsPresence } from "./cursors-presence"
import { pointerEventToCanvasPoint } from "@/lib/utils"
import { LiveObject } from "@liveblocks/client"
import { LayerPreview } from "./layer-preview"

const MAX_LAYERS = 100

interface CanvasProps {
  boardId: string
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const layerIds = useStorage((root) => root.layerIds)

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  })

  const history = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      const liveLayers = storage.get("layers")

      if (liveLayers.size >= MAX_LAYERS) return
      const liveLayersId = storage.get("layerIds")
      const layerId = nanoid()
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      })

      liveLayersId.push(layerId)
      liveLayers.set(layerId, layer)

      setMyPresence(
        {
          selection: [layerId],
        },
        {
          addToHistory: true,
        }
      )

      setCanvasState({
        mode: CanvasMode.None,
      })
    },
    [lastUsedColor]
  )

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }))
  }, [])

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = pointerEventToCanvasPoint(e, camera)
      setMyPresence({ cursor: current })
    },
    []
  )

  const onPointerLeave = useMutation(
    ({ setMyPresence }) => setMyPresence({ cursor: null }),
    []
  )

  // Trigger when we click on screen
  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        })
      }

      history.resume()
    },
    [camera, canvasState, history, insertLayer]
  )

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

        <svg
          onWheel={onWheel}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
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
                onLayerPointerDown={() => {}}
                selectionColor="#000"
              />
            ))}
            <CursorsPresence />
          </g>
        </svg>
      </main>
    </>
  )
}
