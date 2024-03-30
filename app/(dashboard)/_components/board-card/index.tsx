"use client"

import Link from "next/link"
import Image from "next/image"

import { formatDistanceToNow } from "date-fns"

import { MoreHorizontal } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Actions } from "@/components/actions"

import { Footer } from "./footer"

interface BoardCardProps {
  id: string
  title: string
  authorName: string
  authorId: string
  createdAt: number
  imageUrl: string
  orgId: string
  isFavorite: boolean
}

export const BoardCard = ({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) => {
  const { userId } = useAuth()

  const authorLabel = userId === authorId ? "You" : authorName
  const createdAtLabel = formatDistanceToNow(createdAt)

  return (
    <>
      <Link href={`/board/${id}`}>
        <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
          <div className="relative flex-1 bg-amber-50">
            <Image src={imageUrl} alt={title} fill className="object-fit" />

            <div className="opacity-0 group-hover:opacity-40 transition-opacity h-full w-full bg-black" />

            <Actions id={id} title={title} side="right">
              <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
                <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
              </button>
            </Actions>
          </div>

          <Footer
            isFavorite={isFavorite}
            title={title}
            authorLabel={authorLabel}
            createdAtLabel={createdAtLabel}
            // onClick={toggleFavorite}
            // disabled={pendingFavorite || pendingUnfavorite}
          />
        </div>
      </Link>
    </>
  )
}

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  )
}
