import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const createChannel = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    isPrivate: v.boolean(),
    
  },
  handler: async (ctx, { orgId, name, isPrivate }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const channelId = await ctx.db.insert("channels", {
      orgId,
      name,
      isPrivate,
      createdBy: identity.subject,
      createdAt: Date.now(),
      // unread: false,
    });

    if (isPrivate) {
      await ctx.db.insert("channelMemberships", {
        channelId,
        userId: identity.subject,
        role: "member",
        joinedAt: Date.now(),
      });
    }

    return channelId;
  },
});

export const getChannels = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orgMembership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", identity.subject).eq("orgId", orgId)
      )
      .first();

    if (!orgMembership) {
      return [];
    }

    const publicChannels = await ctx.db
      .query("channels")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("isPrivate"), false))
      .collect();

    const privateChannelMemberships = await ctx.db
      .query("channelMemberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const privateChannels = await Promise.all(
      privateChannelMemberships.map(async (membership) => {
        const channel = (await ctx.db.get(membership.channelId as any)) as Doc<
          "channels"
        >;
        if (channel && channel.orgId === orgId) {
          return channel;
        }
        return null;
      })
    );

    return [
      ...publicChannels,
      ...privateChannels.filter((c): c is Doc<"channels"> => c !== null),
    ];
  },
});