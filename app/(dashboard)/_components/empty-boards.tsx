"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useBoardMutation } from "@/hooks/use-board-mutation"

export const EmptyBoards = () => {
  const { createNewBoard, pendingState } = useBoardMutation()

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center">
        <Image src="/note.svg" height={110} width={110} alt="Empty" />

        <h2 className="text-2xl font-semibold mt-6">
          Create your first board!
        </h2>

        <p className="text-muted-foreground textg-sm mt-2">
          Start by creating a board for your organization
        </p>

        <div className="mt-6">
          <Button disabled={pendingState} onClick={createNewBoard} size="lg">
            Create board
          </Button>
        </div>
      </div>
    </>
  )
}
