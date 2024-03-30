"use client"
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu"
import { Link2, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/modal/confirm-modal"

import { useRenameModal } from "@/store/use-rename-modal"
import { useBoardMutation } from "@/hooks/use-board-mutation"
import { useNotifications } from "@/hooks/use-notifications"

interface ActionsProps {
  children: React.ReactNode
  side?: DropdownMenuContentProps["side"]
  sideOffset?: DropdownMenuContentProps["sideOffset"]
  id: string
  title: string
}

export const Actions = ({
  children,
  side,
  sideOffset,
  id,
  title,
}: ActionsProps) => {
  const { addNotificationSuccess, addNotificationError } = useNotifications()
  const { removeBoard, removePendingState } = useBoardMutation()
  const { onOpen: openRenameModal } = useRenameModal()

  const NOTIFICATION_TYPE = "linkCopied"

  const copyLink = () =>
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => addNotificationSuccess(NOTIFICATION_TYPE))
      .catch(() => addNotificationError(NOTIFICATION_TYPE))

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

        <DropdownMenuContent
          onClick={(e) => e.stopPropagation()}
          side={side}
          sideOffset={sideOffset}
          className="w-60"
        >
          <DropdownMenuItem onClick={copyLink} className="p-3 cursor-pointer">
            <Link2 className="h-4 w-4 mr-2" />
            Copy board link
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => openRenameModal(id, title)}
            className="p-3 cursor-pointer"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>

          <ConfirmModal
            header="Delete board?"
            description="This will delete the board and all of its contents."
            disabled={removePendingState}
            onConfirm={() => removeBoard(id)}
          >
            <Button
              variant="ghost"
              className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </ConfirmModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
