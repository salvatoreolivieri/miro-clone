import { nanoid } from "nanoid"

import { useHistory, useMutation, useStorage } from "@/liveblocks.config"
import { CanvasMode, LayerType, Point } from "@/types/canvas"
import { useCallback } from "react"

import { LiveObject } from "@liveblocks/client"
import { useCanvasStore } from "@/store/use-canvas-store"
import {
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  resizeBounds,
} from "@/lib/utils"

export const useLayerMutation = () => {
  const MAX_LAYERS = 100

  const { canvasState, setCanvasState, lastUsedColor } = useCanvasStore()

  const layerIds = useStorage((root) => root.layerIds)

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

  /* Selection
   */
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

  const startMultiSelection = useCallback(
    (current: Point, origin: Point) => {
      if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        })
      }
    },
    [setCanvasState]
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

  /* Drawing
   */
  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers")
      const { pencilDraft } = self.presence

      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null })
        return
      }

      const id = nanoid()
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      )

      const liveLayerIds = storage.get("layerIds")
      liveLayerIds.push(id)

      setMyPresence({ pencilDraft: null })
      setCanvasState({ mode: CanvasMode.Pencil })
    },
    [lastUsedColor]
  )

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return
      }

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      })
    },
    [canvasState.mode]
  )

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      })
    },
    [lastUsedColor]
  )

  return {
    insertLayer,
    translateSelectedLayer,
    resizeSelectedLayer,
    updateSelectionNet,
    startMultiSelection,
    unSelectLayers,
    insertPath,
    continueDrawing,
    startDrawing,
  }
}
