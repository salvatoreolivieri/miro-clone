"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { useQuery } from "convex/react"

import { cn } from "@/lib/utils"
import { Hint } from "@/components/hint"
import { api } from "@/convex/_generated/api"
import { Actions } from "@/components/actions"
import { Button } from "@/components/ui/button"
import { Id } from "@/convex/_generated/dataModel"
import { useRenameModal } from "@/store/use-rename-modal"

interface InfoProps {
  boardId: string
}

const TabSeparator = () => <div className="text-neutral-300 px-1.5">|</div>

export const Info = ({ boardId }: InfoProps) => {
  const { onOpen: openRenameModal } = useRenameModal()

  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  })

  if (!data) return <InfoSkeleton />

  const { title, _id: id } = data

  return (
    <>
      <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
        <Hint label="Go to boards" side="bottom" sideOffset={10}>
          <Button asChild variant="none" className="px-2">
            <Link href="/">
              <Image src="/logo.svg" alt="Logo" height={100} width={100} />
            </Link>
          </Button>
        </Hint>

        <TabSeparator />

        <Hint label="Edit title" side="bottom" sideOffset={10}>
          <Button
            variant="board"
            className="text-base font-normal px-2"
            onClick={() => openRenameModal(id, title)}
          >
            {title}
          </Button>
        </Hint>

        <TabSeparator />

        <Actions id={id} title={title} side="bottom" sideOffset={10}>
          <div>
            <Hint label="Main menu" side="bottom" sideOffset={10}>
              <Button size="icon" variant="board">
                <Menu />
              </Button>
            </Hint>
          </div>
        </Actions>
      </div>
    </>
  )
}

export const InfoSkeleton = () => (
  <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
)
