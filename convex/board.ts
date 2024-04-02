import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
]

export const getIdentity = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) throw new Error("Not authenticated")
  const userId = identity.subject
  const name = identity.name

  return { userId, name }
}

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, name } = await getIdentity(ctx)

    const randomImage = images[Math.floor(Math.random() * images.length)]
    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: userId,
      authorName: name,
      imageUrl: randomImage,
    })

    return board
  },
})

export const remove = mutation({
  args: {
    id: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx)

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", args.id)
      )
      .unique()

    if (existingFavorite) await ctx.db.delete(existingFavorite._id)

    await ctx.db.delete(args.id)
  },
})

export const update = mutation({
  args: {
    id: v.id("boards"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx)

    const title = args.title.trim()

    // Error handling
    if (!title) throw new Error("Title is required")
    if (title.length > 60) throw new Error("Title cannot exceed 60 characters")

    const board = await ctx.db.patch(args.id, {
      title: args.title,
    })

    return board
  },
})

export const favorite = mutation({
  args: {
    id: v.id("boards"),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx)

    const board = await ctx.db.get(args.id)

    if (!board) throw new Error("Board not found")

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique()

    if (existingFavorite) throw new Error("Board already favorited")

    await ctx.db.insert("userFavorites", {
      userId,
      boardId: board._id,
      orgId: args.orgId,
    })

    return board
  },
})

export const unfavorite = mutation({
  args: {
    id: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const { userId } = await getIdentity(ctx)

    const board = await ctx.db.get(args.id)

    if (!board) throw new Error("Board not found")

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique()

    if (!existingFavorite) throw new Error("Favorited board not found")

    await ctx.db.delete(existingFavorite._id)

    return board
  },
})

export const get = query({
  args: {
    id: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const board = ctx.db.get(args.id)

    return board
  },
})
