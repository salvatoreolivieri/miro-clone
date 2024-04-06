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
  useOthersMapped,
} from "@/liveblocks.config"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CanvasMode,
  CanvasState,
  Camera,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas"
import { CursorsPresence } from "./cursors-presence"
import {
  connectionIdToColor,
  pointerEventToCanvasPoint,
  resizeBounds,
  findIntersectingLayersWithRectangle,
} from "@/lib/utils"
import { LiveObject } from "@liveblocks/client"
import { LayerPreview } from "./layer-preview"
import { SelectionBox } from "./selection-box"
import { SelectionTools } from "./selection-tools"
import { useDeleteLayers } from "@/hooks/use-delete-layers"

const MAX_LAYERS = 100

interface CanvasProps {
  boardId: string
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const layerIds = useStorage((root) => root.layerIds)
  const deleteLayer = useDeleteLayers()

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  })

  const history = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        // Handle undo action here
        history.undo()
      }

      // Check if the pressed key is the delete key (keyCode 46) or backspace key (keyCode 8)
      if (event.keyCode === 46 || event.keyCode === 8) {
        // Perform your desired action here, for example, console log
        deleteLayer()
      }
    }

    // Add event listener to the document
    document.addEventListener("keydown", handleKeyDown)

    // Clean up by removing event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteLayer, history]) // Empty dependency array to ensure this effect runs only once on component mount

  const translateSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      }

      const liveLayer = storage.get("layers")

      for (const id of self.presence.selection) {
        const layer = liveLayer.get(id)

        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          })
        }
      }

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      })
    },
    [canvasState]
  )

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable()
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      })

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      )

      setMyPresence({ selection: ids })
    },
    [layerIds]
  )

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      })
    }
  }, [])

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      )

      const liveLayer = storage.get("layers")
      const layer = liveLayer.get(self.presence.selection[0])

      if (layer) {
        layer.update(bounds)
      }
    },
    [canvasState]
  )

  const unSelectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence(
        {
          selection: [],
        },
        {
          addToHistory: true,
        }
      )
    }
  }, [])

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

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause()

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      })
    },
    [history]
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

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayer(current)
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current)
      }

      setMyPresence({ cursor: current })
    },
    [
      camera,
      canvasState,
      resizeSelectedLayer,
      translateSelectedLayer,
      startMultiSelection,
    ]
  )

  const onPointerLeave = useMutation(
    ({ setMyPresence }) => setMyPresence({ cursor: null }),
    []
  )

  // Trigger when we click on screen
  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        // unselect our layer
        unSelectLayers()

        setCanvasState({
          mode: CanvasMode.None,
        })
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        })
      }

      history.resume()
    },
    [camera, canvasState, history, insertLayer, setCanvasState, unSelectLayers]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) return

      // TODO: Add case for drawing

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      })
    },
    [camera, canvasState.mode, setCanvasState]
  )

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

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return
      }

      history.pause()
      e.stopPropagation()

      const point = pointerEventToCanvasPoint(e, camera)

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true })
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point })
    },
    [setCanvasState, camera, history, canvasState.mode]
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
          </g>
        </svg>
      </main>
    </>
  )
}
