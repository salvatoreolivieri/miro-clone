import { useHistory, useMutation } from "@/liveblocks.config"
import { useCallback } from "react"
import { useLayerMutation } from "./use-layer-mutation"
import { useCanvasStore } from "@/store/use-canvas-store"
import { Camera, CanvasMode, Side, XYWH } from "@/types/canvas"
import { pointerEventToCanvasPoint } from "@/lib/utils"

export const useCanvasEvent = () => {
  const {
    insertLayer,
    translateSelectedLayer,
    resizeSelectedLayer,
    updateSelectionNet,
    startMultiSelection,
    unSelectLayers,
    insertPath,
    continueDrawing,
    startDrawing,
  } = useLayerMutation()

  const { camera, canvasState, setCanvasState, setCamera } = useCanvasStore()

  const history = useHistory()

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause()

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      })
    },
    [history, setCanvasState]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      setCamera((camera: any) => ({
        x: camera.x - e.deltaX,
        y: camera.y - e.deltaY,
      }))
    },
    [setCamera]
  )

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
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e)
      }

      setMyPresence({ cursor: current })
    },
    [
      camera,
      canvasState,
      resizeSelectedLayer,
      translateSelectedLayer,
      startMultiSelection,
      updateSelectionNet,
      continueDrawing,
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
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath()
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        })
      }

      history.resume()
    },
    [
      camera,
      canvasState,
      setCanvasState,
      history,
      insertLayer,
      unSelectLayers,
      insertPath,
    ]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) return

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure)
        return
      }

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      })
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  )

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

  return {
    onResizeHandlePointerDown,
    onWheel,
    onPointerMove,
    onPointerLeave,
    onPointerUp,
    onPointerDown,
    onLayerPointerDown,
  }
}
