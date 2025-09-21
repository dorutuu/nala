import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    text: v.string(),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, { channelId, text, parentMessageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const channel = await ctx.db.get(channelId);
    if (!channel) throw new Error("Channel not found");

    return await ctx.db.insert("messages", {
      channelId,
      orgId: channel.orgId,
      userId: identity.subject,
      text,
      parentMessageId: parentMessageId || "",
      createdAt: Date.now(),
      editedAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: { channelId: v.string() },
  handler: async (ctx, { channelId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", message.userId))
          .first();
        return {
          ...message,
          author: author || {
            name: "Unknown user",
            avatarUrl: "",
          },
        };
      })
    );
  },
});