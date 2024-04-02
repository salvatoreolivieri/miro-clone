"use client"

import { Info } from "./info"
import { Participants } from "./participants"
import { Toolbar } from "./toolbar"

interface CanvasProps {
  boardId: string
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // Add some functions here...

  return (
    <>
      <main className="h-full w-full relative bg-neutral-100 touch-none">
        <Info />
        <Participants />
        <Toolbar />
      </main>
    </>
  )
}
