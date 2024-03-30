import { v } from "convex/values"

import { query } from "./_generated/server"
import { getIdentity } from "./board"

export const get = query({
  args: {
    orgId: v.string(),
    // search: v.optional(v.string()),
    // favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx)

    const boards = await ctx.db
      .query("boards")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect()

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
