"use client"

import { ReactNode } from "react"
import { RoomProvider } from "@/liveblocks.config"
import { ClientSideSuspense } from "@liveblocks/react"

interface RoomProps {
  children: ReactNode
  roomId: string
  fallback: NonNullable<ReactNode> | null
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  // Add some functions here...

  return (
    <>
      <RoomProvider id={roomId} initialPresence={{}}>
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </>
  )
}
