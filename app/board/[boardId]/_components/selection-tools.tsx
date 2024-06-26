"use client"

import { memo } from "react"
import { BringToFront, SendToBack, Trash2 } from "lucide-react"
import { Camera, Color } from "@/types/canvas"

import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"
import { useMutation, useSelf } from "@/liveblocks.config"
import { useSelectionBounds } from "@/hooks/use-selection-bounds"
import { ColorPicker } from "./color-picker"
import { useDeleteLayers } from "@/hooks/use-delete-layers"

interface SelectionToolsProps {
  camera: Camera
  setLastUsedColor: (color: Color) => void
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection)
    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers")
        setLastUsedColor(fill)

        selection.forEach((id) => liveLayers.get(id)?.set("fill", fill))
      },
      [selection, setLastUsedColor]
    )

    const deleteLayer = useDeleteLayers()

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds")
        const indices = []

        const arr = liveLayerIds.toImmutable()

        for (const [index, layerId] of arr.entries()) {
          if (selection.includes(layerId)) {
            indices.push(index)
          }
        }

        let newIndex = arr.length - 1
        for (const index of indices) {
          liveLayerIds.move(index, newIndex)
          newIndex--
        }
      },
      [selection]
    )

    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds")
        const indices = []

        const arr = liveLayerIds.toImmutable()

        for (const [index, layerId] of arr.entries()) {
          if (selection.includes(layerId)) {
            indices.push(index)
          }
        }

        let newIndex = 0
        for (const index of indices) {
          liveLayerIds.move(index, newIndex)
          newIndex++
        }
      },
      [selection]
    )

    const selectionBounds = useSelectionBounds()

    if (!selectionBounds) return
    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x
    const y = selectionBounds.y + camera.y

    return (
      <>
        <div
          className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
          style={{
            transform: `translate(
          calc(${x}px - 50%),
          calc(${y - 16}px - 100%)
        )`,
          }}
        >
          <ColorPicker onChange={setFill} />

          <div className="flex flex-col gap-y-0.5">
            <Hint label="Bring to front">
              <Button onClick={moveToFront} variant="board" size="icon">
                <BringToFront />
              </Button>
            </Hint>

            <Hint label="Send to back" side="bottom">
              <Button onClick={moveToBack} variant="board" size="icon">
                <SendToBack />
              </Button>
            </Hint>
          </div>

          <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
            <Hint label="Delete">
              <Button variant="board" size="icon" onClick={deleteLayer}>
                <Trash2 />
              </Button>
            </Hint>
          </div>
        </div>
      </>
    )
  }
)

SelectionTools.displayName = "SelectionTools"
