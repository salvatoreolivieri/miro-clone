"use client"

import { EmptySearch } from "./empty-search"
import { EmptyBoards } from "./empty-boards"
import { EmptyFavorites } from "./empty-favorites"

interface BoardListProps {
  orgId: string
  query: {
    search?: string
    favorites?: string
  }
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
  const data = [] // TODO: cba ge to API call..

  // Empty States:
  if (!data?.length && query.search) {
    return <EmptySearch />
  }

  if (!data?.length && query.favorites) {
    return <EmptyFavorites />
  }

  if (!data?.length) {
    return <EmptyBoards />
  }

  return (
    <>
      <div>BoardList</div>
    </>
  )
}
