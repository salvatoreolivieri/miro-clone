import { Camera, CanvasMode, CanvasState, Color } from "@/types/canvas"
import { create } from "zustand"

interface CanvasStore {
  canvasState: CanvasState
  setCanvasState: (e: CanvasState) => void
  camera: Camera
  setCamera: (e: any) => void
  lastUsedColor: Color
  setLastUsedColor: (e: Color) => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvasState: {
    mode: CanvasMode.None,
  },
  camera: { x: 0, y: 0 },
  lastUsedColor: { r: 255, g: 255, b: 255 },
  setCanvasState: (newCanvasState) => set({ canvasState: newCanvasState }),
  setCamera: (newCamera) => set({ camera: newCamera }),
  setLastUsedColor: (newColor) => set({ lastUsedColor: newColor }),
}))
