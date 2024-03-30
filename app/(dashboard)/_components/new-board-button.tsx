"use client"

import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useBoardMutation } from "@/hooks/use-board-mutation"

interface NewBoardButtonProps {
  disabled?: boolean
}

export const NewBoardButton = ({ disabled }: NewBoardButtonProps) => {
  const { createNewBoard, createPendingState } = useBoardMutation()

  return (
    <>
      <button
        disabled={createPendingState || disabled}
        onClick={createNewBoard}
        className={cn(
          "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
          (createPendingState || disabled) &&
            "opacity-75 hover:bg-blue-600 cursor-not-allowed"
        )}
      >
        <div />

        <Plus className="h-12 w-12 text-white stroke-1" />

        <p className="text-sm text-white font-light">New board</p>
      </button>
    </>
  )
}
