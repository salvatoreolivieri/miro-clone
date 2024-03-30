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
