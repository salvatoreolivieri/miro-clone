"use client"

import { useState, useEffect, FormEventHandler } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRenameModal } from "@/store/use-rename-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useBoardMutation } from "@/hooks/use-board-mutation"

export const RenameModal = () => {
  const { renameBoard, renamePendingState } = useBoardMutation()
  const { isOpen, onClose: closeModal, initialValues } = useRenameModal()
  const [title, setTitle] = useState(initialValues.title)

  // Set it to the new initial title:
  useEffect(() => {
    setTitle(initialValues.title)
  }, [initialValues.title])

  const submitChanges: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    renameBoard(initialValues.id, title)
    closeModal()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit board title</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            Enter a new title for this board
          </DialogDescription>

          <form onSubmit={submitChanges} className="space-y-4">
            <Input
              disabled={renamePendingState}
              required
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Board title"
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button disabled={renamePendingState} type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
