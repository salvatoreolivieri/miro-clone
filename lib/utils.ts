import { Camera, Color } from "@/types/canvas"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const connectionIdToColor = (connectionId: number): string =>
  COLORS[connectionId % COLORS.length]

export const pointerEventToCanvasPoint = (
  e: React.PointerEvent,
  camera: Camera
): Camera => ({
  x: Math.round(e.clientX) - camera.x,
  y: Math.round(e.clientY) - camera.y,
})

export const colorToCss = (color: Color) =>
  `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`
