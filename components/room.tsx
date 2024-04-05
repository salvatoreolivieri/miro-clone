"use client"

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client"
import { ReactNode } from "react"
import { RoomProvider } from "@/liveblocks.config"
import { ClientSideSuspense } from "@liveblocks/react"

import { Layer, Color } from "@/types/canvas"

interface RoomProps {
  children: ReactNode
  roomId: string
  fallback: NonNullable<ReactNode> | null
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  // Add some functions here...

  return (
    <>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, selection: [] }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList(),
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </>
  )
}
