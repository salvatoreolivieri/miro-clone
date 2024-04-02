import { v } from "convex/values"
import { getAllOrThrow } from "convex-helpers/server/relationships"

import { query } from "./_generated/server"
import { getIdentity } from "./board"

export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx)

    if (args.favorites) {
      const favoritedBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", userId).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect()

      const ids = favoritedBoards.map((board) => board.boardId)

      const boards = await getAllOrThrow(ctx.db, ids)

      return boards.map((board) => ({
        ...board,
        isFavorite: true,
      }))
    }

    const title = args.search as string
    let boards = []

    if (title) {
      // Query with search params
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect()
    } else {
      // Query without search params
      boards = await ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect()
    }

    const boardsWithFavoritesRelation = boards.map((board) =>
      ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
          q.eq("userId", userId).eq("boardId", board._id)
        )
        .unique()
        .then((favorite) => ({
          ...board,
          isFavorite: !!favorite,
        }))
    )

    const boardWithFavoriteBoolean = Promise.all(boardsWithFavoritesRelation)

    return boardWithFavoriteBoolean
  },
})
